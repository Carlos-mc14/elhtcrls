"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { TagInput } from "@/components/tag-input"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ImageSelector } from "@/components/image-selector"
import { Loader2 } from "lucide-react"

interface PostFormProps {
  post?: any
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    tags: [] as string[],
  })

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        coverImage: post.coverImage || "",
        tags: post.tags || [],
      })
    }
  }, [post])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }))
  }

  const handleTagsChange = (tags: string[]) => {
    setFormData((prev) => ({ ...prev, tags }))
  }

  const handleCoverImageChange = (url: string) => {
    // Asegurarse de que la URL se guarde correctamente
    console.log("Imagen seleccionada:", url)
    setFormData((prev) => ({ ...prev, coverImage: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      toast({
        title: "Campos requeridos",
        description: "El título y el contenido son obligatorios.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = post ? `/api/posts/${post._id}` : "/api/posts"
      const method = post ? "PUT" : "POST"

      console.log("Enviando datos:", formData)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Error al ${post ? "actualizar" : "crear"} la publicación`)
      }

      toast({
        title: post ? "Publicación actualizada" : "Publicación creada",
        description: post
          ? "La publicación se ha actualizado correctamente."
          : "La publicación se ha creado correctamente.",
      })

      router.push("/admin/posts")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${post ? "actualizar" : "crear"} la publicación. Inténtalo de nuevo.`,
        variant: "destructive",
      })
      console.error("Error al enviar formulario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Título
          </label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Título de la publicación"
            required
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
            Extracto
          </label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Breve descripción de la publicación"
            className="h-24"
          />
        </div>

        <div>
          <ImageSelector value={formData.coverImage} onChange={handleCoverImageChange} label="Imagen de portada" />
          {formData.coverImage && <p className="mt-1 text-xs text-gray-500">URL de imagen: {formData.coverImage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Etiquetas</label>
          <TagInput tags={formData.tags} onChange={handleTagsChange} />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Contenido
          </label>
          <RichTextEditor initialContent={formData.content} onChange={handleContentChange} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/posts")} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {post ? "Actualizando..." : "Creando..."}
            </>
          ) : post ? (
            "Actualizar publicación"
          ) : (
            "Crear publicación"
          )}
        </Button>
      </div>
    </form>
  )
}
