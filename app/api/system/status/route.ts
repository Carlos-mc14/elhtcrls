import { NextResponse } from "next/server"
import { getConnectionStatus } from "@/lib/mongodb"
import { isRedisAvailable } from "@/lib/redis"
import redis from "@/lib/redis"

export async function GET() {
  try {
    // Obtener estado de MongoDB
    const mongodbStatus = getConnectionStatus()

    // Verificar disponibilidad de Redis
    const redisAvailable = await isRedisAvailable()

    // Obtener estadísticas de caché si Redis está disponible
    let cacheStats = {
      hits: 0,
      misses: 0,
      keys: 0,
    }

    if (redisAvailable) {
      try {
        // Estas estadísticas dependen de la implementación específica de Redis
        // y pueden no estar disponibles en todas las versiones/proveedores
        const keyCount = await redis.dbsize()

        cacheStats = {
          hits: 0, // Replace with actual logic if available
          misses: 0, // Replace with actual logic if available
          keys: keyCount,
        }
      } catch (error) {
        console.error("Error al obtener estadísticas de Redis:", error)
      }
    }

    return NextResponse.json({
      mongodb: mongodbStatus,
      redis: redisAvailable,
      cacheStats,
    })
  } catch (error) {
    console.error("Error al obtener estado del sistema:", error)
    return NextResponse.json({ error: "Error al obtener estado del sistema" }, { status: 500 })
  }
}
