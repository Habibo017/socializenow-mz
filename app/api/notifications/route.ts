import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyAuthToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken()
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("socializenow")
    const notificationsCollection = db.collection("notifications")

    const userId = new ObjectId(user.userId)

    const notifications = await notificationsCollection
      .aggregate([
        {
          $match: {
            userId: userId,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "fromUserId",
            foreignField: "_id",
            as: "fromUser",
          },
        },
        {
          $unwind: "$fromUser",
        },
        {
          $project: {
            content: 1,
            type: 1,
            postId: 1,
            commentId: 1,
            isRead: 1,
            createdAt: 1,
            "fromUser._id": 1,
            "fromUser.name": 1,
            "fromUser.username": 1,
            "fromUser.avatar": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    const formattedNotifications = notifications.map((notif) => ({
      ...notif,
      _id: notif._id.toString(),
      userId: notif.userId.toString(),
      fromUser: {
        ...notif.fromUser,
        _id: notif.fromUser._id.toString(),
        avatar: notif.fromUser.avatar || "/placeholder.svg?height=96&width=96",
      },
      postId: notif.postId ? notif.postId.toString() : undefined,
      commentId: notif.commentId ? notif.commentId.toString() : undefined,
    }))

    return NextResponse.json({ notifications: formattedNotifications })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
