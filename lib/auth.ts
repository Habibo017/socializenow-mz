import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import User, { type IUser } from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET!

interface DecodedToken {
  userId: string
  email: string
  username: string
  iat: number
  exp: number
}

export async function verifyAuthToken(): Promise<DecodedToken | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    return decoded
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  const decodedToken = await verifyAuthToken()
  if (!decodedToken) {
    return null
  }

  try {
    await clientPromise // Garante a conexão com o MongoDB
    const user = await User.findById(decodedToken.userId).lean()
    if (!user) {
      return null
    }
    // Converte ObjectId para string para serialização
    return {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    } as IUser
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error)
    return null
  }
}
