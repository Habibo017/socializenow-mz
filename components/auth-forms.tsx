"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormState, useFormStatus } from "react-dom"
import { login } from "@/app/(auth)/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, AtSign, CheckCircle, Send, Shield } from "lucide-react"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCodeLoading, setSendingCodeLoading] = useState(false)
  const [verifyingCodeLoading, setVerifyingCodeLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [verificationCodeSent, setVerificationCodeSent] = useState(false)
  const [isCodeVerified, setIsCodeVerified] = useState(false)
  const router = useRouter()

  const handleSendCode = async () => {
    setError("")
    setSuccessMessage("")
    if (!formData.email || !formData.name) {
      setError("Por favor, preencha seu nome e e-mail para enviar o código.")
      return
    }

    setSendingCodeLoading(true)
    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, name: formData.name }),
      })

      const data = await response.json()
      if (response.ok) {
        setVerificationCodeSent(true)
        setSuccessMessage(data.message)
      } else {
        setError(data.error || "Erro ao enviar código de verificação.")
      }
    } catch (error) {
      setError("Erro de conexão ao enviar código. Tente novamente.")
    } finally {
      setSendingCodeLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError("")
    setSuccessMessage("")
    if (!verificationCode) {
      setError("Por favor, digite o código de verificação.")
      return
    }

    setVerifyingCodeLoading(true)
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, code: verificationCode }),
      })

      const data = await response.json()
      if (response.ok) {
        setIsCodeVerified(true)
        setSuccessMessage("✅ Email verificado! Agora complete seu cadastro.")
        setVerificationCode("")
      } else {
        setError(data.error || "Erro ao verificar código.")
      }
    } catch (error) {
      setError("Erro de conexão ao verificar código. Tente novamente.")
    } finally {
      setVerifyingCodeLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!isCodeVerified) {
      setError("Por favor, verifique seu e-mail antes de criar a conta.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        localStorage.setItem("token", data.token)
        router.push("/feed")
      } else {
        setError(data.error || "Erro ao criar conta")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md rounded-xl shadow-lg border-mozambique-500 border-2">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold text-mozambique-700">Criar Conta</CardTitle>
        <CardDescription className="text-gray-600">Junte-se à nossa comunidade SocializeNow!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Etapa 1: Nome e Email */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
                  disabled={isCodeVerified}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
                  disabled={isCodeVerified}
                  required
                />
              </div>
            </div>
          </div>

          {/* Etapa 2: Verificação de Email */}
          {!isCodeVerified && (
            <div className="space-y-3 border-t pt-4">
              <div className="text-center">
                <Shield className="mx-auto h-8 w-8 text-mozambique-500 mb-2" />
                <p className="text-sm text-gray-600">Precisamos verificar seu email antes de continuar</p>
              </div>

              <Button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCodeLoading || !formData.email || !formData.name || verificationCodeSent}
                className="w-full bg-mozambique-500 hover:bg-mozambique-600"
              >
                {sendingCodeLoading ? (
                  "Enviando código..."
                ) : verificationCodeSent ? (
                  "Código enviado ✓"
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Código de Verificação
                  </>
                )}
              </Button>

              {verificationCodeSent && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      📧 Enviamos um código de 6 dígitos para <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Digite o código recebido</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="text-center text-lg font-mono tracking-widest border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verifyingCodeLoading || verificationCode.length !== 6}
                        className="bg-africanGreen-500 hover:bg-africanGreen-600 px-4"
                      >
                        {verifyingCodeLoading ? "..." : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setVerificationCodeSent(false)
                      setVerificationCode("")
                      setError("")
                      setSuccessMessage("")
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Não recebeu? Clique para reenviar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Etapa 3: Dados da Conta (só aparece após verificação) */}
          {isCodeVerified && (
            <div className="space-y-4 border-t pt-4">
              <div className="text-center bg-green-50 p-3 rounded-lg">
                <CheckCircle className="mx-auto h-6 w-6 text-green-500 mb-1" />
                <p className="text-sm text-green-700 font-medium">Email verificado com sucesso!</p>
                <p className="text-xs text-green-600">Complete os dados abaixo para finalizar seu cadastro</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="seuusername"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                    }
                    className="pl-10 border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Apenas letras minúsculas, números e underscore</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
                    required
                  />
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-mozambique-500 hover:bg-mozambique-600 text-white font-semibold py-3 rounded-md"
                disabled={
                  loading ||
                  !isCodeVerified ||
                  formData.password !== formData.confirmPassword ||
                  formData.password.length < 6
                }
              >
                {loading ? (
                  "Criando sua conta..."
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Criar Minha Conta
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm text-center">{successMessage}</p>
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link href="/login" className="underline text-mozambique-600 hover:text-mozambique-700 font-medium">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, null)

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button
        type="submit"
        className="w-full bg-africanGreen-500 hover:bg-africanGreen-600 text-white font-semibold py-2 rounded-md"
        disabled={pending}
      >
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    )
  }

  return (
    <Card className="mx-auto max-w-sm rounded-xl shadow-lg border-africanGreen-500 border-2">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold text-africanGreen-700">Entrar</CardTitle>
        <CardDescription className="text-gray-600">Bem-vindo de volta à SocializeNow!</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="seu@email.com"
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
                name="password"
                required
                className="pl-10 border-gray-300 focus:border-africanGreen-500 focus:ring-africanGreen-500"
              />
            </div>
          </div>
          <SubmitButton />
          {state?.error && <p className="text-red-500 text-sm text-center">{state.error}</p>}
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
