import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local")
}

export async function POST(req: Request) {
  await dbConnect()

  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 })
  }

  try {
    const user = await User.findOne({ email }).select("+password").lean()

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
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

    return NextResponse.json({ message: "Login bem-sucedido!" }, { status: 200 })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Ocorreu um erro ao tentar fazer login." }, { status: 500 })
  }
}
