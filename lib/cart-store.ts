import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Cart } from "@/types/cart"

interface CartStore {
  cart: Cart
  addItem: (item: Omit<CartItem, "totalPrice">) => void
  removeItem: (productId: string, selectedTags: string[]) => void
  updateQuantity: (productId: string, selectedTags: string[], quantity: number) => void
  clearCart: () => void
  getCartShareId: () => string
  syncWithRedis: () => Promise<void>
}

const createEmptyCart = (): Cart => ({
  id: Math.random().toString(36).substr(2, 9),
  items: [],
  totalItems: 0,
  totalPrice: 0,
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)
  return { totalItems, totalPrice }
}

const saveCartToServer = async (cart: Cart): Promise<void> => {
  try {
    await fetch("/api/cart/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cart),
    })
  } catch (error) {
    console.error("Error saving cart to server:", error)
  }
}

const getCartFromServer = async (cartId: string): Promise<Cart | null> => {
  try {
    const response = await fetch(`/api/cart/${cartId}`)
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error("Error getting cart from server:", error)
    return null
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: createEmptyCart(),

      addItem: async (newItem) => {
        set((state) => {
          const existingItemIndex = state.cart.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              JSON.stringify(item.selectedTags.map((t) => t.tagId).sort()) ===
                JSON.stringify(newItem.selectedTags.map((t) => t.tagId).sort()),
          )

          let updatedItems: CartItem[]

          if (existingItemIndex >= 0) {
            // Actualizar cantidad del item existente
            updatedItems = state.cart.items.map((item, index) =>
              index === existingItemIndex
                ? {
                    ...item,
                    quantity: item.quantity + newItem.quantity,
                    totalPrice: (item.quantity + newItem.quantity) * item.price,
                  }
                : item,
            )
          } else {
            // Agregar nuevo item
            const cartItem: CartItem = {
              ...newItem,
              totalPrice: newItem.quantity * newItem.price,
            }
            updatedItems = [...state.cart.items, cartItem]
          }

          const { totalItems, totalPrice } = calculateTotals(updatedItems)

          const updatedCart = {
            ...state.cart,
            items: updatedItems,
            totalItems,
            totalPrice,
            updatedAt: new Date().toISOString(),
          }

          saveCartToServer(updatedCart).catch(console.error)

          return { cart: updatedCart }
        })
      },

      removeItem: (productId, selectedTags) => {
        set((state) => {
          const updatedItems = state.cart.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                JSON.stringify(item.selectedTags.map((t) => t.tagId).sort()) === JSON.stringify(selectedTags.sort())
              ),
          )

          const { totalItems, totalPrice } = calculateTotals(updatedItems)

          const updatedCart = {
            ...state.cart,
            items: updatedItems,
            totalItems,
            totalPrice,
            updatedAt: new Date().toISOString(),
          }

          saveCartToServer(updatedCart).catch(console.error)

          return { cart: updatedCart }
        })
      },

      updateQuantity: (productId, selectedTags, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedTags)
          return
        }

        set((state) => {
          const updatedItems = state.cart.items.map((item) =>
            item.productId === productId &&
            JSON.stringify(item.selectedTags.map((t) => t.tagId).sort()) === JSON.stringify(selectedTags.sort())
              ? {
                  ...item,
                  quantity,
                  totalPrice: quantity * item.price,
                }
              : item,
          )

          const { totalItems, totalPrice } = calculateTotals(updatedItems)

          const updatedCart = {
            ...state.cart,
            items: updatedItems,
            totalItems,
            totalPrice,
            updatedAt: new Date().toISOString(),
          }

          saveCartToServer(updatedCart).catch(console.error)

          return { cart: updatedCart }
        })
      },

      clearCart: () => {
        const newCart = createEmptyCart()
        set({ cart: newCart })
        saveCartToServer(newCart).catch(console.error)
      },

      getCartShareId: () => {
        return get().cart.id
      },

      syncWithRedis: async () => {
        try {
          const currentCart = get().cart
          const serverCart = await getCartFromServer(currentCart.id)

          if (serverCart && serverCart.updatedAt > currentCart.updatedAt) {
            set({ cart: serverCart })
          } else if (!serverCart) {
            // Save current cart to server if it doesn't exist
            await saveCartToServer(currentCart)
          }
        } catch (error) {
          console.error("Error syncing with server:", error)
        }
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
