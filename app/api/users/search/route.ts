import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyAuthToken } from "@/lib/auth" // Importa a função de verificação de token

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const client = await clientPromise
    const db = client.db("socializenow")
    const usersCollection = db.collection("users")

    // Busca usuários cujo username ou name contenham a query
    const users = await usersCollection
      .find(
        {
          $or: [
            { username: { $regex: query, $options: "i" } }, // Case-insensitive search for username
            { name: { $regex: query, $options: "i" } }, // Case-insensitive search for name
          ],
        },
        { projection: { _id: 1, name: 1, username: 1, avatar: 1 } }, // Retorna apenas campos necessários
      )
      .limit(10) // Limita o número de sugestões
      .toArray()

    // Converte ObjectId para string
    const formattedUsers = users.map((u) => ({
      ...u,
      _id: u._id.toString(),
      avatar: u.avatar || "/placeholder.svg?height=96&width=96",
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
