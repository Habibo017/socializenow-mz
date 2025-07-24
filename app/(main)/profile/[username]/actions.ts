"use server"

import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Post from "@/models/Post"

export async function getUserProfileAndPosts(username: string) {
  await dbConnect()

  try {
    const user = await User.findOne({ username }).select("-password").lean()

    if (!user) {
      return { user: null, posts: [] }
    }

    const userId = user._id

    const posts = await Post.aggregate([
      { $match: { authorId: userId } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "likes",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$postId", "$$postId"] }, { $eq: ["$userId", userId] }],
                },
              },
            },
          ],
          as: "userLiked",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          likedByUser: { $gt: [{ $size: "$userLiked" }, 0] },
          commentsCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          content: 1,
          image: 1,
          createdAt: 1,
          likes: 1,
          likedByUser: 1,
          commentsCount: 1,
          "author._id": 1,
          "author.name": 1,
          "author.username": 1,
          "author.email": 1,
          "author.avatar": 1,
          "author.isVerified": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ])

    // Convert ObjectIds to strings for serialization
    const serializedUser = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }

    const serializedPosts = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      authorId: post.authorId.toString(),
      createdAt: post.createdAt.toISOString(),
      author: {
        ...post.author,
        _id: post.author._id.toString(),
      },
    }))

    return { user: serializedUser, posts: serializedPosts }
  } catch (error) {
    console.error("Erro ao buscar perfil e posts do usuário:", error)
    return { user: null, posts: [] }
  }
}
