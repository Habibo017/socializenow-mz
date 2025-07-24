import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { verifyAuthToken } from "@/lib/auth"

export async function GET(request: Request) {
  await dbConnect()

  const user = await verifyAuthToken()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] }, { status: 200 })
  }

  try {
    const users = await User.find({
      username: { $regex: `^${query}`, $options: "i" }, // Busca que começa com a query, case-insensitive
    })
      .select("username name avatar")
      .limit(10)
      .lean()

    const formattedUsers = users.map((u) => ({
      _id: u._id.toString(),
      username: u.username,
      name: u.name,
      avatar: u.avatar || "/placeholder.svg?height=96&width=96",
    }))

    return NextResponse.json({ users: formattedUsers }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
