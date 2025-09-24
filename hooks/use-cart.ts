"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartTag {
  tagId: string
  tagName: string
  tagColor: string
}

export interface CartItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  selectedTags: CartTag[]
  totalPrice: number
}

export interface Cart {
  id: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}

interface CartStore {
  cart: Cart
  addToCart: (
    productId: string,
    productName: string,
    productImage: string,
    price: number,
    selectedTags: CartTag[],
    quantity?: number,
  ) => void
  removeFromCart: (productId: string, selectedTags: CartTag[]) => void
  updateQuantity: (productId: string, selectedTags: CartTag[], quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const createEmptyCart = (): Cart => ({
  id: Date.now().toString(36) + Math.random().toString(36).substr(2),
  items: [],
  totalItems: 0,
  totalPrice: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)
  return { totalItems, totalPrice }
}

const findItemIndex = (items: CartItem[], productId: string, selectedTags: CartTag[]) => {
  return items.findIndex((item) => {
    if (item.productId !== productId) return false
    if (item.selectedTags.length !== selectedTags.length) return false

    const itemTagIds = item.selectedTags.map((tag) => tag.tagId).sort()
    const selectedTagIds = selectedTags.map((tag) => tag.tagId).sort()

    return itemTagIds.every((tagId, index) => tagId === selectedTagIds[index])
  })
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: createEmptyCart(),
      totalItems: 0,
      totalPrice: 0,

      addToCart: (productId, productName, productImage, price, selectedTags, quantity = 1) => {
        set((state) => {
          const items = [...state.cart.items]
          const existingIndex = findItemIndex(items, productId, selectedTags)

          if (existingIndex >= 0) {
            // Update existing item
            items[existingIndex].quantity += quantity
            items[existingIndex].totalPrice = items[existingIndex].quantity * items[existingIndex].price
          } else {
            // Add new item
            items.push({
              productId,
              productName,
              productImage,
              price,
              quantity,
              selectedTags,
              totalPrice: price * quantity,
            })
          }

          const { totalItems, totalPrice } = calculateTotals(items)

          return {
            cart: {
              ...state.cart,
              items,
              totalItems,
              totalPrice,
              updatedAt: new Date().toISOString(),
            },
            totalItems,
            totalPrice,
          }
        })
      },

      removeFromCart: (productId, selectedTags) => {
        set((state) => {
          const items = state.cart.items.filter((item) => {
            if (item.productId !== productId) return true
            if (item.selectedTags.length !== selectedTags.length) return true

            const itemTagIds = item.selectedTags.map((tag) => tag.tagId).sort()
            const selectedTagIds = selectedTags.map((tag) => tag.tagId).sort()

            return !itemTagIds.every((tagId, index) => tagId === selectedTagIds[index])
          })

          const { totalItems, totalPrice } = calculateTotals(items)

          return {
            cart: {
              ...state.cart,
              items,
              totalItems,
              totalPrice,
              updatedAt: new Date().toISOString(),
            },
            totalItems,
            totalPrice,
          }
        })
      },

      updateQuantity: (productId, selectedTags, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, selectedTags)
          return
        }

        set((state) => {
          const items = [...state.cart.items]
          const existingIndex = findItemIndex(items, productId, selectedTags)

          if (existingIndex >= 0) {
            items[existingIndex].quantity = quantity
            items[existingIndex].totalPrice = items[existingIndex].price * quantity
          }

          const { totalItems, totalPrice } = calculateTotals(items)

          return {
            cart: {
              ...state.cart,
              items,
              totalItems,
              totalPrice,
              updatedAt: new Date().toISOString(),
            },
            totalItems,
            totalPrice,
          }
        })
      },

      clearCart: () => {
        set({
          cart: createEmptyCart(),
          totalItems: 0,
          totalPrice: 0,
        })
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ cart: state.cart }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { totalItems, totalPrice } = calculateTotals(state.cart.items)
          state.totalItems = totalItems
          state.totalPrice = totalPrice
        }
      },
    },
  ),
)
