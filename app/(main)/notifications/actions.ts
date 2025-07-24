"use server"

import { getAuthenticatedUser } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Notification from "@/models/Notification"

export async function getNotifications() {
  await dbConnect()
  const user = await getAuthenticatedUser()

  if (!user) {
    console.error("Usuário não autenticado ao buscar notificações.")
    return null
  }

  try {
    const notifications = await Notification.find({ recipient: user._id })
      .populate("sender", "username name avatar")
      .sort({ createdAt: -1 })
      .lean()

    // Mapear para garantir que _id e sender._id sejam strings
    const formattedNotifications = notifications.map((notif) => ({
      ...notif,
      _id: notif._id.toString(),
      recipient: notif.recipient.toString(),
      sender: {
        ...notif.sender,
        _id: notif.sender._id.toString(),
        avatar: notif.sender.avatar || "/placeholder.svg?height=96&width=96",
      },
      postId: notif.postId ? notif.postId.toString() : undefined,
      commentId: notif.commentId ? notif.commentId.toString() : undefined,
      createdAt: notif.createdAt.toISOString(),
    }))

    return formattedNotifications
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return null
  }
}

export async function getUnreadNotificationsCount(): Promise<number> {
  await dbConnect()
  const user = await getAuthenticatedUser()

  if (!user) {
    return 0
  }

  try {
    const count = await Notification.countDocuments({ recipient: user._id, isRead: false })
    return count
  } catch (error) {
    console.error("Erro ao buscar contagem de notificações não lidas:", error)
    return 0
  }
}

export async function markNotificationAsRead(notificationId: string) {
  await dbConnect()
  const user = await getAuthenticatedUser()

  if (!user) {
    console.error("Usuário não autenticado ao marcar notificação como lida.")
    return { success: false, error: "Não autorizado" }
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: user._id },
      { $set: { isRead: true } },
      { new: true },
    )

    if (!notification) {
      return { success: false, error: "Notificação não encontrada ou não pertence ao usuário." }
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}
