"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare } from "lucide-react"

interface CommentSectionProps {
  postId: string
  comments: any[]
}

export function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments || [])
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push(`/auth/login?callbackUrl=/posts/${postId}`)
      return
    }

    if (!content.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el comentario")
      }

      const data = await response.json()
      setComments([...comments, data.comment])
      setContent("")

      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido publicado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6">Comentarios ({comments.length})</h3>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
              <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Escribe un comentario..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mb-2 min-h-[100px]"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Publicar comentario
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-8 text-center">
          <p className="mb-4">Inicia sesión para dejar un comentario</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href={`/auth/login?callbackUrl=/posts/${postId}`}>Iniciar sesión</a>
          </Button>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.author?.image || ""} alt={comment.author?.name || ""} />
                <AvatarFallback>{comment.author?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.author?.name}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>No hay comentarios todavía. ¡Sé el primero en comentar!</p>
        </div>
      )}
    </div>
  )
}
