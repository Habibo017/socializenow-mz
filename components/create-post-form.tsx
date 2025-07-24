"use client"

import type React from "react"

import { useState, useTransition, useRef } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageIcon, Send } from "lucide-react"
import { createPost } from "@/app/(main)/feed/actions"
import { toast } from "@/components/ui/use-toast"

export function CreatePostForm() {
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro de imagem",
          description: "Apenas arquivos de imagem são permitidos.",
          variant: "destructive",
        })
        setImage(null)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "Erro de imagem",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        })
        setImage(null)
        return
      }
      setImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !image) {
      toast({
        title: "Erro",
        description: "O conteúdo ou uma imagem é obrigatório para o post.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("content", content.trim())
      if (image) {
        formData.append("image", image)
      }

      const result = await createPost(formData)
      if (result.success) {
        setContent("")
        setImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = "" // Clear file input
        }
        toast({
          title: "Post criado!",
          description: "Seu post foi publicado com sucesso.",
          variant: "default",
        })
        // Optionally, trigger a revalidation of the feed here if needed
      } else {
        toast({
          title: "Erro ao criar post",
          description: result.error || "Não foi possível publicar o post.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3">O que está acontecendo?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Compartilhe suas ideias com a comunidade SocializeNow..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={isPending}
          />
          {image && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={URL.createObjectURL(image) || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImage(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              >
                Remover
              </Button>
            </div>
          )}
          <CardFooter className="flex items-center justify-between p-0 pt-4">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 text-gray-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <ImageIcon className="h-5 w-5" />
              Adicionar Imagem
            </Button>
            <Button type="submit" disabled={isPending}>
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Publicando..." : "Publicar"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
