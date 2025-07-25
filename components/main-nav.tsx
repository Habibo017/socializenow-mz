"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, User, Bell, MessageCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MainNav() {
  const pathname = usePathname()

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
              href="/profile/me" // Placeholder for current user's profile
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
                "transition-colors hover:text-mozambique-600",
                pathname === "/notifications" ? "text-mozambique-600" : "text-gray-600",
              )}
            >
              <Bell className="h-5 w-5 inline-block mr-1" /> Notificações
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
          <Avatar className="w-9 h-9">
            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User Avatar" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
