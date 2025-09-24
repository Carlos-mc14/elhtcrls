import type { Product } from "@/types/product"
import { buildApiUrl } from "@/lib/utils/api-utils"

interface GetProductsOptions {
  limit?: number
  sortBy?: "newest" | "oldest" | "price-asc" | "price-desc" | "name"
  category?: string
  search?: string
  tags?: string[] // Array de IDs de etiquetas
}

export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  try {
    const { limit, sortBy = "newest", category, search, tags } = options

    const searchParams = new URLSearchParams()
    if (limit != null) searchParams.append("limit", String(limit))
    if (sortBy) searchParams.append("sortBy", sortBy)
    if (category) searchParams.append("category", category)
    if (search) searchParams.append("search", search)
    if (tags && tags.length > 0) {
      searchParams.append("tags", tags.join(","))
    }

    const response = await fetch(buildApiUrl("/api/products", searchParams), {
      next: { revalidate: 3600 }, // Cache por 1 hora
    })

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`)
    }

    const data = await response.json()

    const items: any[] = Array.isArray(data) ? data : data?.products || data?.data || []

    return items as Product[]
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return []
  }
}

// Función para obtener un producto específico
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/products/${encodeURIComponent(id)}`), {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`Error al obtener producto: ${response.status}`)
    }

    const data = await response.json()
    return data?.product || data || null
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return null
  }
}

export const getProductById = getProduct

// Funciones de utilidad para obtener productos específicos
export async function getLatestProducts(limit = 8): Promise<Product[]> {
  return getProducts({ limit, sortBy: "newest" })
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return getProducts({ limit, sortBy: "newest" })
}

export async function getProductsByCategory(category: string, limit?: number): Promise<Product[]> {
  return getProducts({ category, limit, sortBy: "newest" })
}

// Función para obtener productos por etiquetas
export async function getProductsByTags(tagIds: string[], limit?: number): Promise<Product[]> {
  return getProducts({ tags: tagIds, limit, sortBy: "newest" })
}

// Función para obtener productos por tipo de etiqueta
export async function getProductsByTagType(
  tagType: "category" | "size" | "care" | "location",
  limit?: number,
): Promise<Product[]> {
  // Esta función requeriría primero obtener las etiquetas del tipo específico
  // y luego filtrar productos por esas etiquetas
  // Por simplicidad, se puede implementar más adelante si es necesario
  return getProducts({ limit, sortBy: "newest" })
}
