import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: Request) {
  await dbConnect()

  const { name, email, username, password } = await req.json()

  if (!name || !email || !username || !password) {
    return new Response(JSON.stringify({ error: "Todos os campos são obrigatórios." }), { status: 400 })
  }

  try {
    // Verifica se o email ou username já existem
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      if (existingUser.email === email) {
        return new Response(JSON.stringify({ error: "Este email já está em uso." }), { status: 400 })
      }
      if (existingUser.username === username) {
        return new Response(JSON.stringify({ error: "Este username já está em uso." }), { status: 400 })
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar novo usuário
    const newUser = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      userEmailVerified: true, // Como passou pela verificação de email
      followers: 0,
      following: 0,
      bio: "",
      avatar: "/placeholder.svg?height=96&width=96",
      isVerified: false,
    })

    // Gerar token JWT
    const token = jwt.sign(
      { userId: newUser._id.toString(), username: newUser.username, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    return new Response(JSON.stringify({ token, message: "Conta criada com sucesso!" }), { status: 201 })
  } catch (error) {
    console.error("Erro no registro:", error)
    return new Response(JSON.stringify({ error: "Ocorreu um erro ao criar a conta." }), { status: 500 })
  }
}
