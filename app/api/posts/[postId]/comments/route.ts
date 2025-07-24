import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import dbConnect from "@/lib/dbConnect"
import Comment from "@/models/Comment"
import Post from "@/models/Post"
import Notification from "@/models/Notification"
import User from "@/models/User" // Import User model
import { verifyAuthToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  await dbConnect()
  const { postId } = params

  try {
    const comments = await Comment.aggregate([
      { $match: { postId: new ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "commentlikes", // Nome da coleção de likes de comentários
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$commentId", "$$commentId"] },
                    { $eq: ["$userId", new ObjectId((await verifyAuthToken())?.userId)] },
                  ],
                },
              },
            },
          ],
          as: "userLiked",
        },
      },
      {
        $addFields: {
          likedByUser: { $gt: [{ $size: "$userLiked" }, 0] },
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          likes: 1,
          likedByUser: 1,
          "author._id": 1,
          "author.name": 1,
          "author.username": 1,
          "author.avatar": 1,
        },
      },
      { $sort: { createdAt: 1 } },
    ])

    const formattedComments = comments.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      author: {
        ...comment.author,
        _id: comment.author._id.toString(),
        avatar: comment.author.avatar || "/placeholder.svg?height=96&width=96",
      },
    }))

    return NextResponse.json({ comments: formattedComments }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar comentários:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  await dbConnect()
  const { postId } = params

  const user = await verifyAuthToken()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { content } = await request.json()

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Conteúdo do comentário é obrigatório" }, { status: 400 })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    const newComment = new Comment({
      postId: new ObjectId(postId),
      authorId: new ObjectId(user.userId),
      content: content.trim(),
      likes: 0,
    })

    await newComment.save()

    // Atualizar contagem de comentários no post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })

    // Criar notificação para o autor do post (se não for o próprio comentarista)
    if (post.authorId.toString() !== user.userId) {
      const notification = new Notification({
        userId: post.authorId,
        fromUserId: new ObjectId(user.userId),
        type: "comment_post",
        content: content.trim(),
        postId: new ObjectId(postId),
        commentId: newComment._id,
      })
      await notification.save()
    }

    // Notificações de menção
    const mentionRegex = /@(\w+)/g
    let match
    const mentionedUsernames = new Set<string>()
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUsernames.add(match[1])
    }

    for (const mentionedUsername of mentionedUsernames) {
      const mentionedUser = await User.findOne({ username: mentionedUsername }).select("_id").lean()
      if (
        mentionedUser &&
        mentionedUser._id.toString() !== user.userId &&
        mentionedUser._id.toString() !== post.authorId.toString()
      ) {
        const mentionNotification = new Notification({
          userId: mentionedUser._id,
          fromUserId: new ObjectId(user.userId),
          type: "mention_comment",
          content: content.trim(),
          postId: new ObjectId(postId),
          commentId: newComment._id,
        })
        await mentionNotification.save()
      }
    }

    return NextResponse.json(
      { message: "Comentário adicionado com sucesso", commentId: newComment._id },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
