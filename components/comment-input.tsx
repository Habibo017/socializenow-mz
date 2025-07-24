"use client"

import { AvatarFallback } from "@/components/ui/avatar"

import { AvatarImage } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import type React from "react"

import { useState, useTransition, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { createComment } from "@/app/(main)/feed/actions"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "@/components/ui/use-toast"

interface CommentInputProps {
  postId: string
  onCommentPosted: () => void
}

interface UserSuggestion {
  _id: string
  username: string
  name: string
  avatar?: string
}

export function CommentInput({ postId, onCommentPosted }: CommentInputProps) {
  const [commentContent, setCommentContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedMentionQuery = useDebounce(mentionQuery, 300)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedMentionQuery && debouncedMentionQuery.length > 1) {
        try {
          const response = await fetch(`/api/users/search?query=${debouncedMentionQuery}`)
          if (response.ok) {
            const data = await response.json()
            setSuggestions(data.users)
          } else {
            setSuggestions([])
          }
        } catch (error) {
          console.error("Erro ao buscar sugestões de usuário:", error)
          setSuggestions([])
        }
      } else {
        setSuggestions([])
      }
    }
    fetchSuggestions()
  }, [debouncedMentionQuery])

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCommentContent(value)

    const mentionMatch = value.match(/@(\w+)$/)
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
    } else {
      setMentionQuery(null)
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (username: string) => {
    if (commentContent) {
      const lastAtIndex = commentContent.lastIndexOf("@")
      if (lastAtIndex !== -1) {
        const newContent = commentContent.substring(0, lastAtIndex) + `@${username} `
        setCommentContent(newContent)
        setMentionQuery(null)
        setSuggestions([])
        inputRef.current?.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    startTransition(async () => {
      const result = await createComment(postId, commentContent)
      if (result.success) {
        setCommentContent("")
        setMentionQuery(null)
        setSuggestions([])
        onCommentPosted()
        toast({
          title: "Comentário publicado!",
          variant: "default",
        })
      } else {
        toast({
          title: "Erro ao comentar",
          description: result.error || "Não foi possível publicar o comentário.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Adicione um comentário..."
          value={commentContent}
          onChange={handleCommentChange}
          disabled={isPending}
          className="flex-1 rounded-full pr-10"
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {suggestions.length > 0 && mentionQuery && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {suggestions.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(user.username)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
