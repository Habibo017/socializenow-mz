import type React from "react"
import { MainNav } from "@/components/main-nav"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainNav />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">{children}</main>
    </div>
  )
}
