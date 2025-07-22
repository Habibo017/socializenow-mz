"use client"

import { useState, useEffect, useTransition } from "react"
import { getNotifications, markNotificationAsRead } from "./actions"
import { formatDistanceToNowStrict } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, CheckCircle, MessageCircle, Heart, UserPlus, AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Notification {
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

const getIconForNotificationType = (type: Notification["type"]) => {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5 text-africanRed-500" />
    case "comment":
      return <MessageCircle className="w-5 h-5 text-africanGreen-500" />
    case "follow":
      return <UserPlus className="w-5 h-5 text-blue-500" />
    case "mention":
      return <AtSign className="w-5 h-5 text-purple-500" />
    case "message":
      return <Bell className="w-5 h-5 text-yellow-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const fetchNotifications = async () => {
    setLoading(true)
    const data = await getNotifications()
    if (data) {
      setNotifications(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
    // Polling para novas notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const success = await markNotificationAsRead(id)
      if (success) {
        setNotifications((prev) => prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif)))
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notificações</h1>

      {loading ? (
        <p className="text-center text-gray-600">Carregando notificações...</p>
      ) : notifications.length === 0 ? (
        <p className="text-center text-gray-600">Você não tem novas notificações.</p>
      ) : (
        <Card className="border-mozambique-200">
          <CardContent className="p-0">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-center gap-4 p-4 border-b last:border-b-0 ${
                  notification.isRead ? "bg-gray-50 text-gray-600" : "bg-white text-gray-900 font-medium"
                }`}
              >
                <div className="flex-shrink-0">{getIconForNotificationType(notification.type)}</div>
                <Link
                  href={
                    notification.postId
                      ? `/post/${notification.postId}` // Link para o post
                      : notification.fromUser?.username
                        ? `/profile/${notification.fromUser.username}` // Link para o perfil do remetente
                        : "#" // Fallback
                  }
                  className="flex-1 flex items-center gap-3"
                >
                  <Avatar className="w-10 h-10 border border-gray-200">
                    <AvatarImage
                      src={notification.fromUser?.avatar || "/placeholder.svg"}
                      alt={`@${notification.fromUser?.username}`}
                    />
                    <AvatarFallback>{notification.fromUser?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{notification.content}</p>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </Link>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification._id)}
                    disabled={isPending}
                    className="flex-shrink-0 text-gray-500 hover:text-green-600"
                    title="Marcar como lida"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="sr-only">Marcar como lida</span>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
