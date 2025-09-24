export interface Tag {
  _id: string
  name: string
  slug: string
  internalId: string // Identificador único interno (ej: "cactus-size-small", "interior-size-small")
  description?: string
  color?: string
  isVisible: boolean
  priceRange?: {
    min: number
    max: number
    price: number
    unit: string
  }
  type: "category" | "size" | "care" | "location"
  createdAt: string
  updatedAt: string
}

export interface TagFormData {
  name: string
  internalId: string
  description?: string
  color?: string
  isVisible: boolean
  priceRange?: {
    min: number
    max: number
    price: number
    unit: string
  }
  type: "category" | "size" | "care" | "location"
}
