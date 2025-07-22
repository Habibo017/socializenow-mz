"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bell, Home, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTransition, useState, useEffect } from "react"
import { logout } from "@/app/actions/auth" // Importa a ação de logout
import { getNotifications } from "@/app/(main)/notifications/actions" // Para buscar notificações

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
      // Redirecionamento será tratado pela ação de logout
    })
  }

  const fetchUnreadNotificationsCount = async () => {
    const notifications = await getNotifications()
    if (notifications) {
      const unreadCount = notifications.filter((n) => !n.isRead).length
      setUnreadNotificationsCount(unreadCount)
    }
  }

  useEffect(() => {
    fetchUnreadNotificationsCount()
    const interval = setInterval(fetchUnreadNotificationsCount, 30000) // Polling a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/feed"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/feed" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Home className="h-5 w-5 inline-block mr-1" /> Feed
      </Link>
      <Link
        href="/messages"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/messages" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <MessageCircle className="h-5 w-5 inline-block mr-1" /> Mensagens
      </Link>
      <Link
        href="/notifications"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary relative",
          pathname === "/notifications" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Bell className="h-5 w-5 inline-block mr-1" /> Notificações
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadNotificationsCount}
          </span>
        )}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem asChild>
            <Link href="/profile/me">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
            <span>{isPending ? "Saindo..." : "Sair"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
