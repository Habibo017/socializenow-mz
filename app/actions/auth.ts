"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET!

export async function login(email: string, password: string) {
  await dbConnect()

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return { success: false, error: "Credenciais inválidas" }
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return { success: false, error: "Credenciais inválidas" }
    }

    const token = jwt.sign({ userId: user._id.toString(), username: user.username, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    })

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hora
      path: "/",
      sameSite: "lax",
    })

    return { success: true, redirectTo: "/feed" }
  } catch (error) {
    console.error("Erro no login:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function register(name: string, username: string, email: string, password: string) {
  await dbConnect()

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return { success: false, error: "Email ou nome de usuário já cadastrado." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      avatar: "/placeholder.svg?height=96&width=96", // Default avatar
      isVerified: false,
      bio: "",
      location: "",
      website: "",
      followers: 0,
      following: 0,
      postsCount: 0,
    })

    await newUser.save()

    return { success: true, message: "Usuário registrado com sucesso!" }
  } catch (error) {
    console.error("Erro no registro:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function logout() {
  cookies().delete("token")
  redirect("/login")
}
