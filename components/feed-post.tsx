"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { likePost } from "@/app/(main)/feed/actions"
import { cn } from "@/lib/utils"
import { CommentInput } from "./comment-input"
import { CommentItem } from "./comment-item"
import { toast } from "@/components/ui/use-toast"

interface FeedPostProps {
  post: {
    _id: string
    content: string
    image?: string
    createdAt: string
    likes: number
    commentsCount: number
    likedByUser: boolean
    author: {
      _id: string
      name: string
      username: string
      avatar?: string
      isVerified?: boolean
    }
    comments?: Array<{
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
    }>
  }
  currentUserId?: string
}

export function FeedPost({ post, currentUserId }: FeedPostProps) {
  const [currentLikes, setCurrentLikes] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(post.likedByUser)
  const [currentCommentsCount, setCurrentCommentsCount] = useState(post.commentsCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments || [])
  const [isLiking, startLikingTransition] = useTransition()
  const [isFetchingComments, startFetchingCommentsTransition] = useTransition()

  const handleLikePost = async () => {
    if (!currentUserId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para curtir posts.",
        variant: "destructive",
      })
      return
    }
    startLikingTransition(async () => {
      const result = await likePost(post._id, currentUserId)
      if (result.success) {
        setIsLiked(result.isLiked)
        setCurrentLikes(result.newLikesCount)
      } else {
        toast({
          title: "Erro ao curtir",
          description: result.error || "Não foi possível curtir o post.",
          variant: "destructive",
        })
      }
    })
  }

  const fetchComments = async () => {
    if (showComments && comments.length === 0) {
      startFetchingCommentsTransition(async () => {
        try {
          const response = await fetch(`/api/posts/${post._id}/comments`)
          if (response.ok) {
            const data = await response.json()
            setComments(data.comments)
          } else {
            console.error("Failed to fetch comments:", response.statusText)
            toast({
              title: "Erro",
              description: "Não foi possível carregar os comentários.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error fetching comments:", error)
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao carregar os comentários.",
            variant: "destructive",
          })
        }
      })
    }
  }

  const handleToggleComments = () => {
    setShowComments((prev) => !prev)
    if (!showComments && comments.length === 0) {
      fetchComments()
    }
  }

  const handleCommentPosted = async () => {
    // Re-fetch comments to get the new one
    startFetchingCommentsTransition(async () => {
      try {
        const response = await fetch(`/api/posts/${post._id}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments)
          setCurrentCommentsCount(data.comments.length) // Update count
        } else {
          console.error("Failed to re-fetch comments after post:", response.statusText)
        }
      } catch (error) {
        console.error("Error re-fetching comments:", error)
      }
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar || "/placeholder.svg?height=96&width=96"} alt={post.author.username} />
            <AvatarFallback>{post.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col">
          <Link href={`/profile/${post.author.username}`} className="font-semibold hover:underline">
            {post.author.name}
          </Link>
          <span className="text-gray-500 text-sm">@{post.author.username}</span>
        </div>
        <span className="ml-auto text-gray-500 text-sm">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-800">{post.content}</p>
        {post.image && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-4 border-t border-gray-200">
        <div className="flex justify-around w-full">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-red-500"
            onClick={handleLikePost}
            disabled={isLiking || !currentUserId}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
            <span>{currentLikes}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
            onClick={handleToggleComments}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{currentCommentsCount}</span>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-green-500">
            <Share2 className="h-5 w-5" />
            <span>Compartilhar</span>
          </Button>
        </div>
        {showComments && (
          <div className="w-full space-y-4">
            <CommentInput postId={post._id} onCommentPosted={handleCommentPosted} />
            {isFetchingComments ? (
              <p className="text-center text-gray-500">Carregando comentários...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment._id} comment={comment} currentUserId={currentUserId} />
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhum comentário ainda. Seja o primeiro!</p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
