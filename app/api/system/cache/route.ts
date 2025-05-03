import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import redis from "@/lib/redis"

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    // Solo administradores pueden limpiar la caché
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Limpiar todas las claves
    await redis.flushall()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al limpiar caché:", error)
    return NextResponse.json({ error: "Error al limpiar caché" }, { status: 500 })
  }
}
