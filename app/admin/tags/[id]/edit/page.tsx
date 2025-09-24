"use client"

import { useState, useEffect } from "react"
import { TagForm } from "@/components/tag-form"
import { useParams } from "next/navigation"
import type { Tag } from "@/types/tag"

export default function EditTagPage() {
  const params = useParams()
  const [tag, setTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await fetch(`/api/tags/${params.id}`)
        if (!response.ok) throw new Error("Error al cargar etiqueta")

        const data = await response.json()
        setTag(data.tag)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTag()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Editar Etiqueta</h1>
        <div className="text-center py-8">Cargando etiqueta...</div>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Etiqueta no encontrada</h1>
        <p>La etiqueta que buscas no existe.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Editar Etiqueta</h1>
      </div>
      <TagForm initialData={tag} />
    </div>
  )
}
