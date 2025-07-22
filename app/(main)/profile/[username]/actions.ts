"use server"

import dbConnect from "@/lib/dbConnect"
import User, { type IUser } from "@/models/User"
import Post, { type IPost } from "@/models/Post" // Importa o modelo de Post
import Like from "@/models/Like" // Importa o modelo de Like
import { ObjectId } from "mongodb"

export async function getUserProfile(handle: string): Promise<IUser | null> {
  await dbConnect()
  try {
    // Busca o usuário pelo handle (username)
    const user = await User.findOne({ username: handle }).lean() // .lean() para retornar um objeto JS puro

    if (!user) {
      return null
    }

    // Converte o _id de ObjectId para string, se necessário, para evitar erros de serialização
    const userObject = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(), // Converte Date para string ISO
      updatedAt: user.updatedAt.toISOString(), // Converte Date para string ISO
      avatar: user.avatar || "/placeholder.svg?height=96&width=96", // Garante avatar padrão
    }

    return userObject as IUser
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    return null
  }
}

interface UserPost extends IPost {
  likedByUser: boolean
}

export async function getUserPosts(userId: string, currentUserId?: string): Promise<UserPost[]> {
  await dbConnect()
  try {
    const posts = await Post.find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()

    if (!currentUserId) {
      return posts.map((post) => ({
        ...post,
        _id: post._id.toString(),
        userId: post.userId.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        likedByUser: false, // Se não há usuário logado, não está curtido
      })) as UserPost[]
    }

    const currentUserObjectId = new ObjectId(currentUserId)
    const postIds = posts.map((post) => post._id)

    // Busca todos os likes do usuário logado para os posts encontrados
    const userLikes = await Like.find({
      userId: currentUserObjectId,
      postId: { $in: postIds },
    }).lean()

    const likedPostIds = new Set(userLikes.map((like) => like.postId.toString()))

    return posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      userId: post.userId.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      likedByUser: likedPostIds.has(post._id.toString()),
    })) as UserPost[]
  } catch (error) {
    console.error("Erro ao buscar posts do usuário:", error)
    return []
  }
}
