import type React from "react"
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-africanYellow-50 to-africanRed-50 p-4">
      {children}
    </div>
  )
}
