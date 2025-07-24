"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bell, Home, MessageCircle, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTransition, useState, useEffect } from "react"
import { logout } from "@/app/actions/auth"
import { getUnreadNotificationsCount } from "@/app/(main)/notifications/actions"
import { Input } from "@/components/ui/input" // Importar Input

export function MainNav() {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  const fetchUnreadNotificationsCount = async () => {
    const count = await getUnreadNotificationsCount()
    setUnreadNotificationsCount(count)
  }

  useEffect(() => {
    fetchUnreadNotificationsCount()
    const interval = setInterval(fetchUnreadNotificationsCount, 30000) // Polling a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="font-bold text-2xl text-mozambique-600">
            SocializeNow
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/feed"
              className={cn(
                "transition-colors hover:text-mozambique-600",
                pathname === "/feed" ? "text-mozambique-600" : "text-gray-600",
              )}
            >
              <Home className="h-5 w-5 inline-block mr-1" /> Feed
            </Link>
            <Link
              href="/profile/me"
              className={cn(
                "transition-colors hover:text-mozambique-600",
                pathname.startsWith("/profile") ? "text-mozambique-600" : "text-gray-600",
              )}
            >
              <User className="h-5 w-5 inline-block mr-1" /> Perfil
            </Link>
            <Link
              href="/notifications"
              className={cn(
                "transition-colors hover:text-mozambique-600 relative",
                pathname === "/notifications" ? "text-mozambique-600" : "text-gray-600",
              )}
            >
              <Bell className="h-5 w-5 inline-block mr-1" /> Notificações
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>
            <Link
              href="/messages"
              className={cn(
                "transition-colors hover:text-mozambique-600",
                pathname === "/messages" ? "text-mozambique-600" : "text-gray-600",
              )}
            >
              <MessageCircle className="h-5 w-5 inline-block mr-1" /> Mensagens
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="pl-9 pr-3 py-2 rounded-full bg-gray-100 border-gray-200 focus:border-mozambique-500 focus:ring-mozambique-500"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User Avatar" />
                  <AvatarFallback>US</AvatarFallback>
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
        </div>
      </div>
    </header>
  )
}
