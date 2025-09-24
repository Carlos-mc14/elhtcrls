// lib/api/tags.ts

import type { Tag } from "@/types/tag"
import { buildApiUrl } from "@/lib/utils/api-utils"

interface GetTagsOptions {
  type?: "category" | "size" | "care" | "location"
  visible?: boolean
  search?: string
}

export async function getTags(options: GetTagsOptions = {}): Promise<Tag[]> {
  try {
    const { type, visible, search } = options

    const searchParams = new URLSearchParams()
    if (type) searchParams.append("type", type)
    if (visible !== undefined) searchParams.append("visible", String(visible))
    if (search) searchParams.append("search", search)

    const response = await fetch(buildApiUrl("/api/tags", searchParams), {
      next: { revalidate: 3600 }, // Cache por 1 hora
    })

    if (!response.ok) {
      throw new Error(`Error al obtener etiquetas: ${response.status}`)
    }

    const data = await response.json()

    // Aceptar varias formas de respuesta
    const items: any[] = Array.isArray(data) ? data : data?.tags || data?.data || []

    return items as Tag[]
  } catch (error) {
    console.error("Error al obtener etiquetas:", error)
    return []
  }
}

// Función para obtener una etiqueta específica
export async function getTag(id: string): Promise<Tag | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/tags/${encodeURIComponent(id)}`), {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`Error al obtener etiqueta: ${response.status}`)
    }

    const data = await response.json()
    return data?.tag || data || null
  } catch (error) {
    console.error("Error al obtener etiqueta:", error)
    return null
  }
}

// Funciones de utilidad para obtener etiquetas específicas
export async function getVisibleTags(): Promise<Tag[]> {
  return getTags({ visible: true })
}

export async function getTagsByType(type: "category" | "size" | "care" | "location"): Promise<Tag[]> {
  return getTags({ type, visible: true })
}

export async function getCategoryTags(): Promise<Tag[]> {
  return getTagsByType("category")
}

export async function getSizeTags(): Promise<Tag[]> {
  return getTagsByType("size")
}
