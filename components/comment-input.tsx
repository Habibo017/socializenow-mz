"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useFormStatus } from "react-dom"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDebounce } from "@/hooks/use-debounce"

interface CommentInputProps {
  postId: string
  onCommentAdded: () => void
  addCommentAction: (postId: string, content: string) => Promise<{ success: boolean; error?: string }>
}

interface UserSuggestion {
  _id: string
  name: string
  username: string
  avatar?: string
}

export function CommentInput({ postId, onCommentAdded, addCommentAction }: CommentInputProps) {
  const [commentContent, setCommentContent] = useState("")
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { pending } = useFormStatus()

  const debouncedMentionQuery = useDebounce(mentionQuery, 300)

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!commentContent.trim()) return

    const result = await addCommentAction(postId, commentContent)
    if (result.success) {
      setCommentContent("")
      onCommentAdded()
      setShowSuggestions(false)
      setMentionQuery("")
    } else {
      console.error("Erro ao adicionar comentário:", result.error)
      // Exibir erro para o usuário
    }
  }

  const handleTextareaChange = useCallback(async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCommentContent(value)

    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const potentialMention = textBeforeCursor.substring(lastAtIndex + 1)
      // Regex para verificar se o que vem depois do '@' é um nome de usuário válido (letras, números, underscores)
      const mentionRegex = /^[a-zA-Z0-9_]+$/
      if (potentialMention.length > 0 && mentionRegex.test(potentialMention)) {
        setMentionQuery(potentialMention)
        setShowSuggestions(true)
      } else {
        setMentionQuery("")
        setShowSuggestions(false)
      }
    } else {
      setMentionQuery("")
      setShowSuggestions(false)
    }
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedMentionQuery.length > 0) {
        try {
          const response = await fetch(`/api/users/search?q=${debouncedMentionQuery}`)
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

  const handleSelectSuggestion = (username: string) => {
    if (textareaRef.current) {
      const currentContent = commentContent
      const cursorPosition = textareaRef.current.selectionStart
      const textBeforeCursor = currentContent.substring(0, cursorPosition)
      const lastAtIndex = textBeforeCursor.lastIndexOf("@")

      if (lastAtIndex !== -1) {
        const newContent =
          currentContent.substring(0, lastAtIndex) + `@${username} ` + currentContent.substring(cursorPosition)
        setCommentContent(newContent)
        setShowSuggestions(false)
        setMentionQuery("")
        // Foco e ajuste do cursor
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.setSelectionRange(lastAtIndex + username.length + 2, lastAtIndex + username.length + 2)
          }
        }, 0)
      }
    }
  }

  return (
    <form onSubmit={handleCommentSubmit} className="relative">
      <Textarea
        ref={textareaRef}
        value={commentContent}
        onChange={handleTextareaChange}
        placeholder="Adicione um comentário..."
        className="pr-12 min-h-[60px] resize-none border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
        maxLength={300}
      />
      {showSuggestions && mentionQuery.length > 0 && (
        <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
          <PopoverTrigger asChild>
            {/* Trigger invisível para ancorar o popover */}
            <div className="absolute bottom-full left-0 w-0 h-0" />
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar usuário..." value={mentionQuery} onValueChange={setMentionQuery} />
              <CommandList>
                <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((user) => (
                    <CommandItem
                      key={user._id}
                      onSelect={() => handleSelectSuggestion(user.username)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`@${user.username}`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <span className="text-muted-foreground text-sm">@{user.username}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      <Button
        type="submit"
        size="icon"
        className="absolute bottom-2 right-2 bg-mozambique-500 hover:bg-mozambique-600 text-white"
        disabled={pending || !commentContent.trim()}
      >
        <Send className="w-4 h-4" />
        <span className="sr-only">Enviar Comentário</span>
      </Button>
    </form>
  )
}
