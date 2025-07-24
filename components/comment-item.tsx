"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useTransition } from "react"
import { likeComment } from "@/app/(main)/feed/actions"
import { cn } from "@/lib/utils"

interface CommentItemProps {
  comment: {
    _id: string
    content: string
    createdAt: string
    likes: number
    likedByUser: boolean
    author: {
      _id: string
      name: string
      username: string
      avatar?: string
    }
  }
  currentUserId?: string
}

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const [currentLikes, setCurrentLikes] = useState(comment.likes)
  const [isLiked, setIsLiked] = useState(comment.likedByUser)
  const [isPending, startTransition] = useTransition()

  const handleLikeComment = async () => {
    if (!currentUserId) {
      // Redirecionar para login ou mostrar mensagem
      return
    }
    startTransition(async () => {
      const result = await likeComment(comment._id, currentUserId)
      if (result.success) {
        setIsLiked(result.isLiked)
        setCurrentLikes(result.newLikesCount)
      } else {
        console.error("Erro ao curtir/descurtir comentário:", result.error)
      }
    })
  }

  return (
    <div className="flex items-start space-x-3">
      <Link href={`/profile/${comment.author.username}`}>
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={comment.author.avatar || "/placeholder.svg?height=96&width=96"}
            alt={comment.author.username}
          />
          <AvatarFallback>{comment.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center space-x-1">
          <Link href={`/profile/${comment.author.username}`} className="font-semibold hover:underline">
            {comment.author.name}
          </Link>
          <span className="text-gray-500 text-sm">@{comment.author.username}</span>
          <span className="text-gray-500 text-sm">·</span>
          <span className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        <p className="text-gray-800 mt-1">{comment.content}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeComment}
            disabled={isPending || !currentUserId}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500"
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
            <span className="text-sm">{currentLikes}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
