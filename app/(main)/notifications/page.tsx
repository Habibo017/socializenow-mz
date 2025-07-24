"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState, useTransition } from "react"
import { getNotifications, markNotificationAsRead } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"

interface Notification {
  _id: string
  content: string
  type: string
  postId?: string
  commentId?: string
  isRead: boolean
  createdAt: string
  fromUser: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isPending, startTransition] = useTransition()

  const fetchNotifications = async () => {
    startTransition(async () => {
      const fetchedNotifications = await getNotifications()
      if (fetchedNotifications) {
        setNotifications(fetchedNotifications)
      }
    })
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Polling a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    setNotifications((prev) => prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif)))
  }

  const getNotificationMessage = (notification: Notification) => {
    const { fromUser, type, content, postId, commentId } = notification
    const userLink = (
      <Link href={`/profile/${fromUser.username}`} className="font-semibold hover:underline">
        @{fromUser.username}
      </Link>
    )

    switch (type) {
      case "like_post":
        return (
          <>
            {userLink} curtiu seu{" "}
            <Link href={`/post/${postId}`} className="font-semibold hover:underline">
              post
            </Link>
            .
          </>
        )
      case "comment_post":
        return (
          <>
            {userLink} comentou no seu{" "}
            <Link href={`/post/${postId}`} className="font-semibold hover:underline">
              post
            </Link>
            : "{content}"
          </>
        )
      case "mention_comment":
        return (
          <>
            {userLink} mencionou você em um{" "}
            <Link href={`/post/${postId}#comment-${commentId}`} className="font-semibold hover:underline">
              comentário
            </Link>
            : "{content}"
          </>
        )
      case "like_comment":
        return (
          <>
            {userLink} curtiu seu{" "}
            <Link href={`/post/${postId}#comment-${commentId}`} className="font-semibold hover:underline">
              comentário
            </Link>
            .
          </>
        )
      case "follow":
        return <>{userLink} começou a seguir você.</>
      default:
        return content
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma notificação por enquanto.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-4 p-3 rounded-lg",
                    notification.isRead ? "bg-gray-50" : "bg-blue-50",
                  )}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={notification.fromUser.avatar || "/placeholder.svg"}
                      alt={notification.fromUser.username}
                    />
                    <AvatarFallback>{notification.fromUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{getNotificationMessage(notification)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={isPending}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
