"use server"

import { revalidatePath } from "next/cache"
import { formatDistanceToNowStrict } from "date-fns"
import { ptBR } from "date-fns/locale"
import { verifyAuthToken } from "@/lib/auth" // Importa a função de verificação de token

interface PostData {
  _id: string
  username: string
  handle: string
  avatarSrc: string
  timeAgo: string
  content: string
  imageUrl?: string
  likes: number
  commentsCount: number
  likedByUser: boolean
}

interface CommentData {
  _id: string
  content: string
  createdAt: string
  author: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
}

export async function createPost(prevState: any, formData: FormData) {
  const token = await verifyAuthToken()
  if (!token) {
    return { error: "Você precisa estar logado para criar um post." }
  }

  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!content.trim() && !imageUrl.trim()) {
    return { error: "O conteúdo ou a URL da imagem é obrigatório." }
  }

  try {
    const postData: { content: string; imageUrl?: string } = { content }
    if (imageUrl) {
      postData.imageUrl = imageUrl
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Envia o token no header
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.error || "Erro ao criar post." }
    }

    revalidatePath("/feed") // Revalida o cache do feed para mostrar o novo post
    return { success: true, message: "Post criado com sucesso!" }
  } catch (error) {
    console.error("Erro ao criar post:", error)
    return { error: "Erro interno do servidor." }
  }
}

export async function getFeedPosts(): Promise<PostData[]> {
  const token = await verifyAuthToken()
  if (!token) {
    // Se não houver token, retorna um feed vazio ou público limitado
    console.warn("Nenhum token de autenticação encontrado. Retornando posts públicos ou vazios.")
    return []
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Envia o token no header
      },
      next: {
        tags: ["posts"], // Tag para revalidação específica
      },
    })

    if (!response.ok) {
      console.error("Erro ao buscar posts do feed:", response.status, response.statusText)
      return []
    }

    const data = await response.json()

    return data.posts.map((post: any) => ({
      _id: post._id,
      username: post.author.name,
      handle: post.author.username,
      avatarSrc: post.author.avatar || "/placeholder.svg?height=96&width=96",
      timeAgo: formatDistanceToNowStrict(new Date(post.createdAt), {
        addSuffix: true,
        locale: ptBR,
      }),
      content: post.content,
      imageUrl: post.image, // 'image' é o campo no seu modelo de Post
      likes: post.likes,
      commentsCount: post.commentsCount,
      likedByUser: post.likedByUser,
    }))
  } catch (error) {
    console.error("Erro ao buscar posts do feed:", error)
    return []
  }
}

export async function toggleLikePost(postId: string): Promise<{ liked: boolean; likes: number } | null> {
  const token = await verifyAuthToken()
  if (!token) {
    console.error("Usuário não autenticado para curtir/descurtir.")
    return null
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro ao curtir/descurtir post:", errorData.error)
      return null
    }

    const data = await response.json()
    revalidatePath("/feed") // Revalida o feed para atualizar o estado do like
    revalidatePath(`/profile/${data.authorHandle}`) // Revalida o perfil do autor do post
    return { liked: data.liked, likes: data.likes }
  } catch (error) {
    console.error("Erro na requisição de curtir/descurtir:", error)
    return null
  }
}

export async function addComment(postId: string, content: string): Promise<{ success: boolean; error?: string }> {
  const token = await verifyAuthToken()
  if (!token) {
    return { success: false, error: "Você precisa estar logado para comentar." }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "Erro ao adicionar comentário." }
    }

    revalidatePath("/feed") // Revalida o feed para atualizar a contagem de comentários
    revalidatePath(`/profile/${token.username}`) // Revalida o perfil do usuário que comentou
    return { success: true }
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error)
    return { success: false, error: "Erro interno do servidor." }
  }
}

export async function getCommentsForPost(postId: string): Promise<CommentData[]> {
  const token = await verifyAuthToken()
  if (!token) {
    console.error("Usuário não autenticado para ver comentários.")
    return []
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/${postId}/comments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 0, // Sempre busca os comentários mais recentes
      },
    })

    if (!response.ok) {
      console.error("Erro ao buscar comentários:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data.comments.map((comment: any) => ({
      _id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        _id: comment.author._id,
        name: comment.author.name,
        username: comment.author.username,
        avatar: comment.author.avatar || "/placeholder.svg?height=96&width=96",
      },
    }))
  } catch (error) {
    console.error("Erro ao buscar comentários:", error)
    return []
  }
}
