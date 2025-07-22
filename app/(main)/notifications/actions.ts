"use server"

import { revalidatePath } from "next/cache"
import { verifyAuthToken } from "@/lib/auth"

interface NotificationData {
  _id: string
  userId: string
  fromUser: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
  type: "like" | "comment" | "follow" | "mention" | "message"
  postId?: string
  commentId?: string
  content: string
  isRead: boolean
  createdAt: string
}

export async function getNotifications(): Promise<NotificationData[]> {
  const token = await verifyAuthToken()
  if (!token) {
    console.error("Usuário não autenticado para buscar notificações.")
    return []
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 0, // Sempre busca as notificações mais recentes
      },
    })

    if (!response.ok) {
      console.error("Erro ao buscar notificações:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data.notifications.map((notif: any) => ({
      _id: notif._id,
      userId: notif.userId,
      fromUser: {
        _id: notif.fromUser._id,
        name: notif.fromUser.name,
        username: notif.fromUser.username,
        avatar: notif.fromUser.avatar || "/placeholder.svg?height=96&width=96",
      },
      type: notif.type,
      postId: notif.postId,
      commentId: notif.commentId,
      content: notif.content,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    }))
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const token = await verifyAuthToken()
  if (!token) {
    console.error("Usuário não autenticado para marcar notificação como lida.")
    return false
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro ao marcar notificação como lida:", errorData.error)
      return false
    }

    revalidatePath("/notifications") // Revalida a página de notificações
    return true
  } catch (error) {
    console.error("Erro na requisição para marcar notificação como lida:", error)
    return false
  }
}
