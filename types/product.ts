import type { Tag } from "./tag"

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  additionalImages: string[]
  category: string
  stock: number
  facebookUrl?: string
  postSlug?: string
  tags?: Tag[]
  tagStock?: Array<{
    tagId: string
    stock: number
    tag?: Tag
  }>
  createdAt: string
  updatedAt: string
}
