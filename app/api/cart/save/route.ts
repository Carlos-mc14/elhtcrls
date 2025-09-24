import { type NextRequest, NextResponse } from "next/server"
import { saveCartToRedis } from "@/lib/cart-redis"
import type { Cart } from "@/types/cart"

export async function POST(request: NextRequest) {
  try {
    const cart: Cart = await request.json()
    await saveCartToRedis(cart)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving cart:", error)
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 })
  }
}
