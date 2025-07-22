"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // O token é definido como cookie HTTP-only pela API, não precisamos armazená-lo no cliente
        router.push("/feed")
      } else {
        setError(data.error || "Erro ao fazer login. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro de conexão:", err)
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-sm rounded-xl shadow-lg border-africanGreen-500 border-2">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold text-africanGreen-700">Entrar</CardTitle>
        <CardDescription className="text-gray-600">Bem-vindo de volta à SocializeNow!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 border-gray-300 focus:border-africanGreen-500 focus:ring-africanGreen-500"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 border-gray-300 focus:border-africanGreen-500 focus:ring-africanGreen-500"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-africanGreen-500 hover:bg-africanGreen-600 text-white font-semibold py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link href="/register" className="underline text-africanGreen-600 hover:text-africanGreen-700">
            Cadastre-se
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
