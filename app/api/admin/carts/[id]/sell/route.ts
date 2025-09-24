import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { markCartAsSold } from "@/lib/cart-redis"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const params = await context.params
    const cartId = params.id

    if (!cartId) {
      return NextResponse.json({ error: "ID de carrito requerido" }, { status: 400 })
    }

    const soldBy = session.user.name ?? session.user.email ?? "";
    const success = await markCartAsSold(cartId, soldBy)

    if (!success) {
      return NextResponse.json({ error: "Error al marcar carrito como vendido" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Carrito marcado como vendido y stock reducido" })
  } catch (error) {
    console.error("Error al marcar carrito como vendido:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al marcar carrito como vendido",
      },
      { status: 500 },
    )
  }
}
