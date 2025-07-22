import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET!

function verifyToken(request: NextRequest) {
  // Primeiro tenta pegar do cookie (sistema atual)
  const cookieStore = cookies()
  let token = cookieStore.get("token")?.value

  // Se não encontrar no cookie, tenta no header Authorization (compatibilidade)
  if (!token) {
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { postId } = await params

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "ID do post inválido" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("socializenow")
    const posts = db.collection("posts")
    const likes = db.collection("likes")
    const notifications = db.collection("notifications")
    const users = db.collection("users")

    const userId = new ObjectId(user.userId)
    const postObjectId = new ObjectId(postId)

    // Check if user already liked this post
    const existingLike = await likes.findOne({
      userId: userId,
      postId: postObjectId,
    })

    let liked = false

    if (existingLike) {
      // Unlike the post
      await likes.deleteOne({ _id: existingLike._id })
      await posts.updateOne({ _id: postObjectId }, { $inc: { likes: -1 } })
    } else {
      // Like the post
      await likes.insertOne({
        userId: userId,
        postId: postObjectId,
        createdAt: new Date(),
      })
      await posts.updateOne({ _id: postObjectId }, { $inc: { likes: 1 } })
      liked = true

      // Create notification for post author
      const post = await posts.findOne({ _id: postObjectId })
      if (post && !post.authorId.equals(userId)) {
        // Buscar dados do usuário atual para a notificação
        const currentUser = await users.findOne({ _id: userId })

        await notifications.insertOne({
          userId: post.authorId,
          fromUserId: userId,
          type: "like",
          message: `${currentUser?.name || user.name} curtiu seu post`,
          postId: postObjectId,
          read: false,
          createdAt: new Date(),
        })
      }
    }

    // Get updated like count
    const updatedPost = await posts.findOne({ _id: postObjectId })
    const likeCount = updatedPost?.likes || 0

    return NextResponse.json({
      liked,
      likes: likeCount,
    })
  } catch (error) {
    console.error("Like post error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
