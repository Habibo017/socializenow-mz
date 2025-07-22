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
    const user = await User.findOne({ email }).lean()

    if (!user) {
      return { error: "Credenciais inválidas." }
    }

    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password) // Assumindo que 'password' é o campo do hash no seu modelo User

    if (!isPasswordValid) {
      return { error: "Credenciais inválidas." }
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id.toString(), handle: user.handle, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }, // Token expira em 1 hora
    )

    // Define o token como um cookie HTTP-only
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure em produção (HTTPS)
      maxAge: 60 * 60 * 1, // 1 hora
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

export async function register(formData: FormData) {
  await dbConnect()

  const username = formData.get("username") as string
  const handle = formData.get("handle") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!username || !handle || !email || !password) {
    return { error: "Todos os campos são obrigatórios." }
  }

  try {
    // Verifica se o email ou handle já existem
    const existingUser = await User.findOne({ $or: [{ email }, { handle }] })
    if (existingUser) {
      if (existingUser.email === email) {
        return { error: "Este email já está em uso." }
      }
      if (existingUser.handle === handle) {
        return { error: "Este handle já está em uso." }
      }
    }

    // Faz o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10) // 10 é o salt rounds

    // Cria o novo usuário
    const newUser = await User.create({
      username,
      handle,
      email,
      password: hashedPassword, // Salva a senha hasheada
      followers: 0,
      following: 0,
      bio: "", // Biografia inicial vazia
      avatarSrc: "/placeholder.svg?height=96&width=96",
      backgroundSrc: "/placeholder.svg?height=160&width=400",
    })

    // Opcional: Logar o usuário automaticamente após o registro
    const token = jwt.sign(
      { userId: newUser._id.toString(), handle: newUser.handle, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "1h" },
    )

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1,
      path: "/",
      sameSite: "lax",
    })

    redirect("/feed")
  } catch (error) {
    console.error("Erro no registro:", error)
    return { error: "Ocorreu um erro ao tentar registrar." }
  }
}

export async function logout() {
  cookies().delete("token")
  redirect("/login")
}
