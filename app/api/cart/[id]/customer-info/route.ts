import { type NextRequest, NextResponse } from "next/server"
import { getCartFromRedis, saveCartToRedis } from "@/lib/cart-redis"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { customerName, customerPhone } = await request.json()
    const params = await context.params
    const cartId = params.id

    if (!cartId) {
      return NextResponse.json({ error: "ID de carrito requerido" }, { status: 400 })
    }

    const cart = await getCartFromRedis(cartId)
    if (!cart) {
      return NextResponse.json({ error: "Carrito no encontrado" }, { status: 404 })
    }

    const updatedCart = {
      ...cart,
      customerName: customerName?.trim() || cart.customerName,
      customerPhone: customerPhone?.trim() || cart.customerPhone,
      updatedAt: new Date().toISOString(),
    }

    await saveCartToRedis(updatedCart)

    return NextResponse.json({
      success: true,
      cart: updatedCart,
    })
  } catch (error) {
    console.error("Error updating customer info:", error)
    return NextResponse.json({ error: "Error al actualizar información del cliente" }, { status: 500 })
  }
}
