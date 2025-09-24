import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getActiveCarts } from "@/lib/cart-redis"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const carts = await getActiveCarts()

    return NextResponse.json({ carts })
  } catch (error) {
    console.error("Error al obtener carritos:", error)
    return NextResponse.json({ error: "Error al obtener carritos" }, { status: 500 })
  }
}
