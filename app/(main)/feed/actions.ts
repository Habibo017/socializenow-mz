"use server"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

// Função para verificar o token JWT e obter o usuário atual
async function getCurrentUser() {
  const token = cookies().get("token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch {
    return null
  }
}

export async function getFeedPosts() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return []
  }

  try {
    // Fazer requisição para a API de posts
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts`, {
      headers: {
        Authorization: `Bearer ${cookies().get("token")?.value}`,
      },
    })

    if (!response.ok) {
      console.error("Erro ao buscar posts:", response.status)
      return []
    }

    const data = await response.json()

    return data.posts.map((post: any) => ({
      _id: post._id,
      username: post.author.name,
      handle: post.author.username || post.author.email.split("@")[0],
      avatarSrc: post.author.avatar || "/placeholder.svg?height=48&width=48",
      timeAgo: getTimeAgo(new Date(post.createdAt)),
      content: post.content,
      imageUrl: post.image,
      likes: post.likes,
      comments: post.commentsCount,
      likedByUser: post.likedByUser,
    }))
  } catch (error) {
    console.error("Erro ao buscar posts do feed:", error)
    return []
  }
}

export async function createPost(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: "Você precisa estar logado para criar um post." }
  }

  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!content || content.trim().length === 0) {
    return { error: "O conteúdo do post é obrigatório." }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies().get("token")?.value}`,
      },
      body: JSON.stringify({
        content: content.trim(),
        image: imageUrl || undefined,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, postId: data.postId }
    } else {
      return { error: data.error || "Erro ao criar post." }
    }
  } catch (error) {
    console.error("Erro ao criar post:", error)
    return { error: "Ocorreu um erro ao criar o post." }
  }
}

// Função auxiliar para calcular tempo decorrido
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return "agora"
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInHours < 24) return `${diffInHours}h`
  if (diffInDays < 7) return `${diffInDays}d`

  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })
}
