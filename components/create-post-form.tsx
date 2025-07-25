"use client"

import { useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { createPost } from "@/app/(main)/feed/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Send } from "lucide-react"

export function CreatePostForm() {
  const [state, formAction] = useFormState(createPost, null)
  const [showImageInput, setShowImageInput] = useState(false)

  function SubmitButton() {
    const { pending } = useFormStatus()
    return (
      <Button type="submit" className="bg-mozambique-500 hover:bg-mozambique-600 text-white" disabled={pending}>
        {pending ? (
          "Publicando..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Publicar
          </>
        )}
      </Button>
    )
  }

  return (
    <Card className="border-mozambique-200">
      <CardHeader>
        <CardTitle className="text-lg text-mozambique-700">O que está acontecendo?</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Textarea
              name="content"
              placeholder="Compartilhe suas ideias com a comunidade SocializeNow..."
              className="min-h-[100px] border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
              maxLength={500}
              required
            />
          </div>

          {showImageInput && (
            <div>
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                className="border-gray-300 focus:border-mozambique-500 focus:ring-mozambique-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageInput(!showImageInput)}
              className="text-mozambique-600 hover:text-mozambique-700"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {showImageInput ? "Remover Imagem" : "Adicionar Imagem"}
            </Button>

            <SubmitButton />
          </div>

          {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

          {state?.success && <p className="text-green-500 text-sm">Post publicado com sucesso!</p>}
        </form>
      </CardContent>
    </Card>
  )
}
