import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Notification from "@/models/Notification"
import { getAuthenticatedUser } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { notificationId: string } }) {
  await dbConnect()
  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { notificationId } = params

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: user._id },
      { $set: { isRead: true } },
      { new: true },
    )

    if (!notification) {
      return NextResponse.json({ error: "Notificação não encontrada ou não pertence ao usuário" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notificação marcada como lida", notification }, { status: 200 })
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
