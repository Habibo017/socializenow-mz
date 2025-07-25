"use server"

import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local")
}

export async function login(formData: FormData) {
  await dbConnect()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios." }
  }

  try {
    const user = await User.findOne({ email }).select("+password").lean()

    if (!user) {
      return { error: "Credenciais inválidas." }
    }

    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { error: "Credenciais inválidas." }
    }

    // Gera o token JWT
    const token = jwt.sign({ userId: user._id.toString(), username: user.username, name: user.name }, JWT_SECRET, {
      expiresIn: "7d",
    })

    // Define o token como um cookie HTTP-only
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
      sameSite: "lax",
    })

    // Redireciona para o feed após o login bem-sucedido
    redirect("/feed")
  } catch (error) {
    console.error("Erro no login:", error)
    return { error: "Ocorreu um erro ao tentar fazer login." }
  }
}

export async function logout() {
  cookies().delete("token")
  redirect("/login")
}
