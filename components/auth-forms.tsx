"use client"

import type React from "react"

import { useFormState, useFormStatus } from "react-dom"
import { login, register } from "@/app/(auth)/actions" // Importe as Server Actions
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
  // Remova:
  // const [email, setEmail] = useState("")
  // const [password, setPassword] = useState("")
  // const [name, setName] = useState("")

  // Substitua por:
  const [state, formAction] = useFormState(register, null)

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button
        type="submit"
        className="w-full bg-mozambique-500 hover:bg-mozambique-600 text-white font-semibold py-2 rounded-md"
        disabled={pending}
      >
        {pending ? "Cadastrando..." : "Cadastrar"}
      </Button>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Esta função não é mais necessária, pois a ação é passada diretamente para o formulário
  }

  return (
    <Card className="mx-auto max-w-sm rounded-xl shadow-lg border-mozambique-500 border-2">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold text-mozambique-700">Criar Conta</CardTitle>
        <CardDescription className="text-gray-600">Junte-se à nossa comunidade SocializeNow!</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          {" "}
          {/* Use 'action' prop */}
          <div className="grid gap-2">
            <Label htmlFor="username">Nome de Usuário</Label> {/* Alterado de 'name' para 'username' */}
            <Input
              id="username"
              type="text"
              name="username" // Adicione o atributo 'name'
              placeholder="joao_silva"
              required
              // Remova value e onChange
              className="border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="handle">Handle (@)</Label> {/* Novo campo para o handle */}
            <Input
              id="handle"
              type="text"
              name="handle" // Adicione o atributo 'name'
              placeholder="joao.silva"
              required
              className="border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email" // Adicione o atributo 'name'
              placeholder="mario@exemplo.com"
              required
              // Remova value e onChange
              className="border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              name="password" // Adicione o atributo 'name'
              required
              // Remova value e onChange
              className="border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
            />
          </div>
          <SubmitButton /> {/* Use o componente do botão */}
          {state?.error && <p className="text-red-500 text-sm text-center">{state.error}</p>}
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link href="/login" className="underline text-mozambique-600 hover:text-mozambique-700">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoginForm() {
  // Remova:
  // const [email, setEmail] = useState("")
  // const [password, setPassword] = useState("")

  // Substitua por:
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
          {" "}
          {/* Use 'action' prop */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email" // Adicione o atributo 'name'
              placeholder="mario@exemplo.com"
              required
              // Remova value e onChange
              className="border-gray-300 focus:border-africanGreen-500 focus:ring-africanGreen-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              name="password" // Adicione o atributo 'name'
              required
              // Remova value e onChange
              className="border-gray-300 focus:border-africanGreen-500 focus:ring-africanGreen-500"
            />
          </div>
          <SubmitButton /> {/* Use o componente do botão */}
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
