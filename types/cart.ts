export interface CartItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  selectedTags: Array<{
    tagId: string
    tagName: string
    tagColor: string
  }>
  totalPrice: number
}

export interface Cart {
  id: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  createdAt: string
  updatedAt: string
  status: "active" | "sold" | "expired"
  customerName?: string
  customerPhone?: string
  soldAt?: string
  soldBy?: string
}

export interface ReservedStock {
  productId: string
  selectedTags: string[]
  quantity: number
  cartId: string
  expiresAt: string
}
