import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import User from "@/models/User"
import dbConnect from "./dbConnect"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local")
}

const secret = new TextEncoder().encode(JWT_SECRET)

export async function verifyAuthToken(): Promise<{ userId: string; username: string } | null> {
  const token = cookies().get("token")?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    })
    return { userId: payload.userId as string, username: payload.username as string }
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    return null
  }
}

export async function getAuthenticatedUser() {
  const tokenData = await verifyAuthToken()
  if (!tokenData) {
    return null
  }

  try {
    await dbConnect() // Garante a conexão com o MongoDB
    const user = await User.findById(tokenData.userId).select("-password").lean()

    if (!user) {
      return null
    }

    // Converte ObjectId para string para serialização
    return {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("Erro ao buscar usuário autenticado:", error)
    return null
  }
}
