import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyAuthToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { notificationId: string } }) {
  try {
    const user = await verifyAuthToken()
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { notificationId } = params

    if (!ObjectId.isValid(notificationId)) {
      return NextResponse.json({ error: "ID da notificação inválido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("socializenow")
    const notificationsCollection = db.collection("notifications")

    const notificationObjectId = new ObjectId(notificationId)
    const userId = new ObjectId(user.userId)

    // Atualiza a notificação, garantindo que o usuário logado é o destinatário
    const result = await notificationsCollection.updateOne(
      { _id: notificationObjectId, userId: userId },
      { $set: { isRead: true } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notificação não encontrada ou não pertence ao usuário" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notificação marcada como lida" })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
