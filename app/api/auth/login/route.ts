import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: Request) {
  await dbConnect()

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user._id.toString(), username: user.username, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    })

    // Define o cookie httpOnly
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure em produção
      maxAge: 60 * 60, // 1 hora
      path: "/", // Disponível em toda a aplicação
      sameSite: "lax", // Proteção CSRF
    })

    return NextResponse.json({ message: "Login bem-sucedido", redirectTo: "/feed" }, { status: 200 })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
