import type React from "react"
import { MainNav } from "@/components/main-nav"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login") // Redireciona para o login se não estiver autenticado
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
