import redis from "@/lib/redis"
import type { Cart, CartItem, ReservedStock } from "@/types/cart"

const CART_TTL = 14 * 24 * 60 * 60 // 2 semanas en segundos
const RESERVATION_TTL = 30 * 60 // 30 minutos para reservas temporales

export async function saveCartToRedis(cart: Cart): Promise<void> {
  try {
    const key = `cart:${cart.id}`
    await redis.set(key, cart, { ex: CART_TTL })

    // También guardar en índice de carritos activos
    if (cart.status === "active") {
      await redis.sadd("active_carts", cart.id)
    }
  } catch (error) {
    console.error("Error saving cart to Redis:", error)
    throw error
  }
}

export async function getCartFromRedis(cartId: string): Promise<Cart | null> {
  try {
    const key = `cart:${cartId}`
    const cart = await redis.get<Cart>(key)
    return cart
  } catch (error) {
    console.error("Error getting cart from Redis:", error)
    return null
  }
}

export async function deleteCartFromRedis(cartId: string): Promise<void> {
  try {
    const key = `cart:${cartId}`
    await redis.del(key)
    await redis.srem("active_carts", cartId)
  } catch (error) {
    console.error("Error deleting cart from Redis:", error)
    throw error
  }
}

export async function reserveStock(cartId: string, items: CartItem[]): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Verificar stock disponible para cada item usando API
    for (const item of items) {
      const response = await fetch(`${baseUrl}/api/products/${item.productId}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: item.quantity,
          selectedTags: item.selectedTags.map((t) => t.tagId),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Error verificando stock para ${item.productName}`)
      }
    }

    // Reservar stock para este carrito
    for (const item of items) {
      const reservationKey = `reservation:${cartId}:${item.productId}:${JSON.stringify(item.selectedTags.map((t) => t.tagId).sort())}`
      const reservation: ReservedStock = {
        productId: item.productId,
        selectedTags: item.selectedTags.map((t) => t.tagId),
        quantity: item.quantity,
        cartId,
        expiresAt: new Date(Date.now() + CART_TTL * 1000).toISOString(),
      }

      await redis.set(reservationKey, reservation, { ex: CART_TTL })
      await redis.sadd(`product_reservations:${item.productId}`, reservationKey)
    }

    return true
  } catch (error) {
    console.error("Error reserving stock:", error)
    throw error
  }
}

export async function releaseStock(cartId: string): Promise<void> {
  try {
    const reservationKeys = await redis.keys(`reservation:${cartId}:*`)

    for (const key of reservationKeys) {
      const reservation = await redis.get<ReservedStock>(key)
      if (reservation) {
        await redis.srem(`product_reservations:${reservation.productId}`, key)
      }
      await redis.del(key)
    }
  } catch (error) {
    console.error("Error releasing stock:", error)
    throw error
  }
}

export async function getReservedQuantity(productId: string, selectedTags: string[]): Promise<number> {
  try {
    const reservationKeys = await redis.smembers(`product_reservations:${productId}`)
    let totalReserved = 0

    for (const key of reservationKeys) {
      const reservation = await redis.get<ReservedStock>(key)
      if (reservation && JSON.stringify(reservation.selectedTags.sort()) === JSON.stringify(selectedTags.sort())) {
        totalReserved += reservation.quantity
      }
    }

    return totalReserved
  } catch (error) {
    console.error("Error getting reserved quantity:", error)
    return 0
  }
}

export async function markCartAsSold(cartId: string, soldBy: string): Promise<boolean> {
  try {
    const cart = await getCartFromRedis(cartId)
    if (!cart) {
      throw new Error("Carrito no encontrado")
    }

    if (cart.status !== "active") {
      throw new Error("El carrito no está activo")
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Reducir stock de productos usando API
    for (const item of cart.items) {
      const response = await fetch(`${baseUrl}/api/products/${item.productId}/reduce-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: item.quantity,
          tagId: item.selectedTags.length > 0 ? item.selectedTags[0].tagId : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Error reduciendo stock para ${item.productName}: ${error.message}`)
      }
    }

    // Actualizar estado del carrito
    const updatedCart: Cart = {
      ...cart,
      status: "sold",
      soldAt: new Date().toISOString(),
      soldBy,
      updatedAt: new Date().toISOString(),
    }

    await saveCartToRedis(updatedCart)
    await redis.srem("active_carts", cartId)
    await releaseStock(cartId)

    return true
  } catch (error) {
    console.error("Error marking cart as sold:", error)
    throw error
  }
}

export async function getActiveCarts(): Promise<Cart[]> {
  try {
    const cartIds = await redis.smembers("active_carts")
    const carts: Cart[] = []

    for (const cartId of cartIds) {
      const cart = await getCartFromRedis(cartId)
      if (cart && cart.status === "active") {
        carts.push(cart)
      }
    }

    return carts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error getting active carts:", error)
    return []
  }
}

export async function validateCartStock(cartId: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const cart = await getCartFromRedis(cartId)
    if (!cart) {
      return { valid: false, errors: ["Carrito no encontrado"] }
    }

    const errors: string[] = []
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    for (const item of cart.items) {
      const response = await fetch(`${baseUrl}/api/products/${item.productId}/validate-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: item.quantity,
          selectedTags: item.selectedTags.map((t) => t.tagId),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        errors.push(error.message || `Error validando ${item.productName}`)
      }
    }

    return { valid: errors.length === 0, errors }
  } catch (error) {
    console.error("Error validating cart stock:", error)
    return { valid: false, errors: ["Error al validar stock"] }
  }
}
