"use server"

import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import type { IUser } from "@/models/User" // Importe a interface IUser

export async function getUserProfile(handle: string): Promise<IUser | null> {
  await dbConnect()
  try {
    // Busca o usuário pelo handle (que é único)
    const user = await User.findOne({ handle }).lean() // .lean() para retornar um objeto JS puro

    if (!user) {
      return null
    }

    // Converte o _id de ObjectId para string, se necessário, para evitar erros de serialização
    const userObject = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(), // Converte Date para string ISO
      updatedAt: user.updatedAt.toISOString(), // Converte Date para string ISO
    }

    return userObject as IUser
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    return null
  }
}
