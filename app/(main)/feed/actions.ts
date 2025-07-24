"use server"

import dbConnect from "@/lib/dbConnect"
import Post from "@/models/Post"
import Like from "@/models/Like"
import Comment from "@/models/Comment"
import CommentLike from "@/models/CommentLike"
import Notification from "@/models/Notification"
import User from "@/models/User" // Import User model
import { getAuthenticatedUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error("Usuário não autenticado.")
  }

  await dbConnect()

  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string // Optional image URL

  if (!content && !imageUrl) {
    throw new Error("O post não pode estar vazio.")
  }

  try {
    const newPost = await Post.create({
      content,
      imageUrl: imageUrl || undefined,
      author: user._id,
    })
    revalidatePath("/feed")
    return JSON.parse(JSON.stringify(newPost))
  } catch (error) {
    console.error("Erro ao criar post:", error)
    throw new Error("Não foi possível criar o post.")
  }
}

export async function getFeedPosts() {
  const user = await getAuthenticatedUser()
  await dbConnect()

  try {
    const posts = await Post.find({}).populate("author", "username name avatar").sort({ createdAt: -1 }).lean()

    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        const likesCount = await Like.countDocuments({ post: post._id })
        const commentsCount = await Comment.countDocuments({ post: post._id })
        const isLikedByUser = user ? await Like.exists({ post: post._id, user: user._id }) : false
        return {
          ...JSON.parse(JSON.stringify(post)),
          likesCount,
          commentsCount,
          isLikedByUser: !!isLikedByUser,
        }
      }),
    )
    return postsWithLikeStatus
  } catch (error) {
    console.error("Erro ao buscar posts:", error)
    throw new Error("Não foi possível carregar o feed.")
  }
}

export async function likePost(postId: string, isLiking: boolean) {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error("Usuário não autenticado.")
  }

  await dbConnect()

  try {
    if (isLiking) {
      await Like.findOneAndUpdate(
        { post: postId, user: user._id },
        { post: postId, user: user._id },
        { upsert: true, new: true },
      )
      // Create notification for the post author
      const post = await Post.findById(postId).lean()
      if (post && post.author.toString() !== user._id.toString()) {
        await Notification.findOneAndUpdate(
          { recipient: post.author, type: "like", "metadata.postId": postId, "metadata.likerId": user._id },
          {
            recipient: post.author,
            sender: user._id,
            type: "like",
            message: `${user.name} curtiu seu post.`,
            read: false,
            metadata: { postId: postId, likerId: user._id },
          },
          { upsert: true, new: true },
        )
      }
    } else {
      await Like.deleteOne({ post: postId, user: user._id })
      // Remove notification if unliked
      const post = await Post.findById(postId).lean()
      if (post && post.author.toString() !== user._id.toString()) {
        await Notification.deleteOne({
          recipient: post.author,
          type: "like",
          "metadata.postId": postId,
          "metadata.likerId": user._id,
        })
      }
    }
    const likesCount = await Like.countDocuments({ post: postId })
    revalidatePath("/feed")
    revalidatePath(`/profile/${user.username}`) // Revalidate user's profile if they liked their own post
    return likesCount
  } catch (error) {
    console.error("Erro ao curtir/descurtir post:", error)
    throw new Error("Não foi possível processar a curtida.")
  }
}

export async function createComment(postId: string, content: string) {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error("Usuário não autenticado.")
  }

  await dbConnect()

  if (!content.trim()) {
    throw new Error("O comentário não pode estar vazio.")
  }

  try {
    const newComment = await Comment.create({
      post: postId,
      author: user._id,
      content,
    })

    // Create notification for the post author
    const post = await Post.findById(postId).lean()
    if (post && post.author.toString() !== user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: user._id,
        type: "comment",
        message: `${user.name} comentou no seu post.`,
        read: false,
        metadata: { postId: postId, commentId: newComment._id },
      })
    }

    // Create notifications for mentioned users
    const mentionRegex = /@([a-zA-Z0-9_]+)/g
    let match
    const mentionedUsernames = new Set<string>()
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUsernames.add(match[1])
    }

    if (mentionedUsernames.size > 0) {
      const mentionedUsers = await User.find({ username: { $in: Array.from(mentionedUsernames) } }).lean()
      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser._id.toString() !== user._id.toString()) {
          // Don't notify self
          await Notification.create({
            recipient: mentionedUser._id,
            sender: user._id,
            type: "mention",
            message: `${user.name} te mencionou em um comentário.`,
            read: false,
            metadata: { postId: postId, commentId: newComment._id, mentionerId: user._id },
          })
        }
      }
    }

    revalidatePath("/feed")
    revalidatePath(`/posts/${postId}`) // If you have a single post page
    return JSON.parse(JSON.stringify(newComment))
  } catch (error) {
    console.error("Erro ao criar comentário:", error)
    throw new Error("Não foi possível criar o comentário.")
  }
}

export async function getCommentsForPost(postId: string) {
  const user = await getAuthenticatedUser()
  await dbConnect()

  try {
    const comments = await Comment.find({ post: postId })
      .populate("author", "username name avatar")
      .sort({ createdAt: 1 })
      .lean()

    const commentsWithLikeStatus = await Promise.all(
      comments.map(async (comment) => {
        const likesCount = await CommentLike.countDocuments({ comment: comment._id })
        const isLikedByUser = user ? await CommentLike.exists({ comment: comment._id, user: user._id }) : false
        return {
          ...JSON.parse(JSON.stringify(comment)),
          likesCount,
          isLikedByUser: !!isLikedByUser,
        }
      }),
    )
    return commentsWithLikeStatus
  } catch (error) {
    console.error("Erro ao buscar comentários:", error)
    throw new Error("Não foi possível carregar os comentários.")
  }
}

export async function likeComment(commentId: string, isLiking: boolean) {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error("Usuário não autenticado.")
  }

  await dbConnect()

  try {
    if (isLiking) {
      await CommentLike.findOneAndUpdate(
        { comment: commentId, user: user._id },
        { comment: commentId, user: user._id },
        { upsert: true, new: true },
      )
      // Create notification for the comment author
      const comment = await Comment.findById(commentId).lean()
      if (comment && comment.author.toString() !== user._id.toString()) {
        await Notification.findOneAndUpdate(
          {
            recipient: comment.author,
            type: "comment_like",
            "metadata.commentId": commentId,
            "metadata.likerId": user._id,
          },
          {
            recipient: comment.author,
            sender: user._id,
            type: "comment_like",
            message: `${user.name} curtiu seu comentário.`,
            read: false,
            metadata: { commentId: commentId, likerId: user._id },
          },
          { upsert: true, new: true },
        )
      }
    } else {
      await CommentLike.deleteOne({ comment: commentId, user: user._id })
      // Remove notification if unliked
      const comment = await Comment.findById(commentId).lean()
      if (comment && comment.author.toString() !== user._id.toString()) {
        await Notification.deleteOne({
          recipient: comment.author,
          type: "comment_like",
          "metadata.commentId": commentId,
          "metadata.likerId": user._id,
        })
      }
    }
    const likesCount = await CommentLike.countDocuments({ comment: commentId })
    revalidatePath("/feed") // Revalidate feed to update comment likes
    return likesCount
  } catch (error) {
    console.error("Erro ao curtir/descurtir comentário:", error)
    throw new Error("Não foi possível processar a curtida do comentário.")
  }
}
