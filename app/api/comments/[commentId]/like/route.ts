import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import dbConnect from "@/lib/dbConnect"
import Comment from "@/models/Comment"
import CommentLike from "@/models/CommentLike"
import Notification from "@/models/Notification"
import { verifyAuthToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { commentId: string } }) {
  await dbConnect()
  const { commentId } = params

  const user = await verifyAuthToken()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const userId = new ObjectId(user.userId)
    const commentObjectId = new ObjectId(commentId)

    const existingLike = await CommentLike.findOne({ userId, commentId: commentObjectId })
    let newLikesCount: number

    if (existingLike) {
      // Descurtir
      await CommentLike.deleteOne({ _id: existingLike._id })
      await Comment.findByIdAndUpdate(commentObjectId, { $inc: { likes: -1 } })
      newLikesCount = (await Comment.findById(commentObjectId).select("likes").lean())?.likes || 0
      return NextResponse.json({ message: "Comentário descurtido", isLiked: false, newLikesCount }, { status: 200 })
    } else {
      // Curtir
      const newLike = new CommentLike({ userId, commentId: commentObjectId })
      await newLike.save()
      await Comment.findByIdAndUpdate(commentObjectId, { $inc: { likes: 1 } })
      newLikesCount = (await Comment.findById(commentObjectId).select("likes").lean())?.likes || 0

      // Criar notificação para o autor do comentário (se não for o próprio)
      const comment = await Comment.findById(commentObjectId).select("authorId postId").lean()
      if (comment && comment.authorId.toString() !== user.userId) {
        const notification = new Notification({
          userId: comment.authorId,
          fromUserId: userId,
          type: "like_comment",
          postId: comment.postId,
          commentId: commentObjectId,
        })
        await notification.save()
      }

      return NextResponse.json({ message: "Comentário curtido", isLiked: true, newLikesCount }, { status: 200 })
    }
  } catch (error) {
    console.error("Erro ao curtir/descurtir comentário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
