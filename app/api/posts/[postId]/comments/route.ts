import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyAuthToken } from "@/lib/auth" // Usando a função centralizada

const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g // Regex para encontrar menções

export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const user = await verifyAuthToken()
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { postId } = params

    if (!postId || !ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "ID do post inválido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("socializenow")
    const commentsCollection = db.collection("comments")

    const comments = await commentsCollection
      .aggregate([
        {
          $match: {
            postId: new ObjectId(postId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            "author._id": 1,
            "author.name": 1,
            "author.username": 1,
            "author.avatar": 1,
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
      ])
      .toArray()

    // Formata os IDs para string
    const formattedComments = comments.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      author: {
        ...comment.author,
        _id: comment.author._id.toString(),
        avatar: comment.author.avatar || "/placeholder.svg?height=96&width=96",
      },
    }))

    return NextResponse.json({ comments: formattedComments })
  } catch (error) {
    console.error("Erro ao buscar comentários:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params

    const user = await verifyAuthToken()
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Conteúdo do comentário é obrigatório" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("socializenow")
    const commentsCollection = db.collection("comments")
    const postsCollection = db.collection("posts")
    const notificationsCollection = db.collection("notifications")
    const usersCollection = db.collection("users")

    // Verificar se o post existe
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) })
    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Buscar dados do usuário atual
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(user.userId) })
    if (!currentUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Criar comentário
    const comment = {
      postId: new ObjectId(postId),
      authorId: new ObjectId(user.userId),
      content: content.trim(),
      createdAt: new Date(),
      likes: 0, // Adiciona campo de likes para comentários
    }

    const result = await commentsCollection.insertOne(comment)

    // Incrementar contador de comentários no post
    await postsCollection.updateOne({ _id: new ObjectId(postId) }, { $inc: { commentsCount: 1 } })

    // Criar notificação para o autor do post (se não for o próprio usuário)
    if (post.authorId.toString() !== user.userId) {
      await notificationsCollection.insertOne({
        userId: post.authorId,
        fromUserId: new ObjectId(user.userId),
        type: "comment",
        content: `${currentUser.name} comentou no seu post: "${content.substring(0, 50)}..."`,
        postId: new ObjectId(postId),
        isRead: false,
        createdAt: new Date(),
      })
    }

    // Processar menções no comentário
    const mentions = content.match(MENTION_REGEX)
    if (mentions && mentions.length > 0) {
      const uniqueMentions = Array.from(new Set(mentions.map((m) => m.substring(1)))) // Remove '@' e duplica
      const mentionedUsers = await usersCollection
        .find({ username: { $in: uniqueMentions } }, { projection: { _id: 1, username: 1 } })
        .toArray()

      for (const mentionedUser of mentionedUsers) {
        // Evita notificar o próprio usuário se ele se mencionou
        if (mentionedUser._id.toString() !== user.userId) {
          await notificationsCollection.insertOne({
            userId: mentionedUser._id,
            fromUserId: new ObjectId(user.userId),
            type: "mention",
            content: `${currentUser.name} te mencionou em um comentário: "${content.substring(0, 50)}..."`,
            postId: new ObjectId(postId),
            commentId: result.insertedId,
            isRead: false,
            createdAt: new Date(),
          })
        }
      }
    }

    return NextResponse.json({
      message: "Comentário adicionado com sucesso",
      commentId: result.insertedId,
    })
  } catch (error) {
    console.error("Add comment error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
