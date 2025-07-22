"use client"

import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useTransition, useEffect } from "react"
import { addComment, getCommentsForPost, toggleLikePost } from "@/app/(main)/feed/actions"
import { CommentInput } from "./comment-input"
import { CommentItem } from "./comment-item"

interface FeedPostProps {
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

interface Comment {
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

export function FeedPost({
  _id,
  username,
  handle,
  avatarSrc,
  timeAgo,
  content,
  imageUrl,
  likes: initialLikes,
  commentsCount: initialCommentsCount,
  likedByUser: initialLikedByUser,
}: FeedPostProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [likedByUser, setLikedByUser] = useState(initialLikedByUser)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isPending, startTransition] = useTransition()
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    setLikes(initialLikes)
    setLikedByUser(initialLikedByUser)
    setCommentsCount(initialCommentsCount)
  }, [initialLikes, initialLikedByUser, initialCommentsCount])

  const handleLikeToggle = () => {
    startTransition(async () => {
      const result = await toggleLikePost(_id)
      if (result) {
        setLikes(result.likes)
        setLikedByUser(result.liked)
      }
    })
  }

  const handleCommentAdded = () => {
    setCommentsCount((prev) => prev + 1)
    // Recarregar comentários após adicionar um novo
    fetchComments()
  }

  const fetchComments = async () => {
    setCommentsLoading(true)
    const fetchedComments = await getCommentsForPost(_id)
    if (fetchedComments) {
      setComments(fetchedComments)
    }
    setCommentsLoading(false)
  }

  const handleToggleComments = () => {
    setShowComments((prev) => !prev)
    if (!showComments && comments.length === 0) {
      fetchComments()
    }
  }

  return (
    <Card className="w-full rounded-xl shadow-md border-africanGreen-100">
      <CardHeader className="flex flex-row items-center gap-4 p-4 pb-0">
        <Link href={`/profile/${handle}`}>
          <Avatar className="w-12 h-12 border-2 border-africanGreen-500">
            <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={`@${handle}`} />
            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="grid gap-0.5">
          <Link href={`/profile/${handle}`} className="font-semibold text-gray-900 hover:underline">
            {username}
          </Link>
          <div className="text-sm text-muted-foreground">
            <Link href={`/profile/${handle}`} className="hover:underline">
              @{handle}
            </Link>{" "}
            • {timeAgo}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-gray-800 leading-relaxed mb-4">{content}</p>
        {imageUrl && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Post image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4 pt-0 border-t border-gray-100">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${
                likedByUser ? "text-africanRed-500" : "text-gray-600 hover:text-africanRed-500"
              }`}
              onClick={handleLikeToggle}
              disabled={isPending}
            >
              <Heart className={`w-5 h-5 ${likedByUser ? "fill-current" : ""}`} />
              <span className="text-sm">{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-600 hover:text-africanGreen-500"
              onClick={handleToggleComments}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{commentsCount}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-mozambique-500">
            <Share2 className="w-5 h-5" />
            <span className="text-sm">Compartilhar</span>
          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-4 border-t border-gray-100 pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Comentários</h3>
            <CommentInput postId={_id} onCommentAdded={handleCommentAdded} addCommentAction={addComment} />
            {commentsLoading ? (
              <p className="text-center text-gray-500 mt-4">Carregando comentários...</p>
            ) : comments.length > 0 ? (
              <div className="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    author={comment.author}
                    content={comment.content}
                    createdAt={comment.createdAt}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">Nenhum comentário ainda. Seja o primeiro!</p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
