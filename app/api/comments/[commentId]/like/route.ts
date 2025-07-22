import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyAuthToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    const user = await verifyAuthToken()
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { commentId } = params

    if (!ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "ID do comentário inválido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("socializenow")
    const commentsCollection = db.collection("comments")
    const likesCollection = db.collection("commentLikes") // Nova coleção para likes de comentários
    const notificationsCollection = db.collection("notifications")
    const usersCollection = db.collection("users")

    const userId = new ObjectId(user.userId)
    const commentObjectId = new ObjectId(commentId)

    // Verificar se o comentário existe
    const comment = await commentsCollection.findOne({ _id: commentObjectId })
    if (!comment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário já curtiu este comentário
    const existingLike = await likesCollection.findOne({
      userId: userId,
      commentId: commentObjectId,
    })

    let liked = false

    if (existingLike) {
      // Descurtir o comentário
      await likesCollection.deleteOne({ _id: existingLike._id })
      await commentsCollection.updateOne({ _id: commentObjectId }, { $inc: { likes: -1 } })
    } else {
      // Curtir o comentário
      await likesCollection.insertOne({
        userId: userId,
        commentId: commentObjectId,
        createdAt: new Date(),
      })
      await commentsCollection.updateOne({ _id: commentObjectId }, { $inc: { likes: 1 } })
      liked = true

      // Criar notificação para o autor do comentário (se não for o próprio usuário)
      if (comment.authorId.toString() !== user.userId) {
        const currentUser = await usersCollection.findOne({ _id: userId })
        await notificationsCollection.insertOne({
          userId: comment.authorId,
          fromUserId: userId,
          type: "like",
          content: `${currentUser?.name || user.username} curtiu seu comentário: "${comment.content.substring(0, 50)}..."`,
          commentId: commentObjectId,
          isRead: false,
          createdAt: new Date(),
        })
      }
    }

    // Obter a contagem atualizada de likes do comentário
    const updatedComment = await commentsCollection.findOne({ _id: commentObjectId })
    const likeCount = updatedComment?.likes || 0

    return NextResponse.json({
      liked,
      likes: likeCount,
    })
  } catch (error) {
    console.error("Erro ao curtir/descurtir comentário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
