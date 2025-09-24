import { Redis } from "@upstash/redis"

// Crear una instancia de Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Función para verificar si Redis está disponible
export async function isRedisAvailable(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.warn("Redis no está disponible:", error)
    return false
  }
}

// Función genérica para obtener datos de la caché o de la fuente original
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 60 * 60, // 1 hora por defecto
): Promise<T> {
  try {
    // Verificar si Redis está disponible
    const redisAvailable = await isRedisAvailable()

    if (!redisAvailable) {
      // Si Redis no está disponible, obtener datos directamente
      return await fetchFn()
    }

    // Intentar obtener datos de la caché
    const cachedData = await redis.get<T>(key)

    if (cachedData) {
      console.log(`Datos obtenidos de caché: ${key}`)
      return cachedData
    }

    // Si no hay datos en caché, obtenerlos de la fuente original
    console.log(`Obteniendo datos frescos: ${key}`)
    const freshData = await fetchFn()

    // Guardar en caché para futuras solicitudes
    if (freshData) {
      await redis.set(key, freshData, { ex: ttl })
    }

    return freshData
  } catch (error) {
    console.error(`Error en fetchWithCache para clave ${key}:`, error)
    // En caso de error con Redis, obtener datos directamente
    return await fetchFn()
  }
}

// Función para invalidar una clave específica en la caché
export async function invalidateCache(key: string): Promise<void> {
  try {
    const redisAvailable = await isRedisAvailable()
    if (redisAvailable) {
      await redis.del(key)
      console.log(`Caché invalidada: ${key}`)
    }
  } catch (error) {
    console.error(`Error al invalidar caché para clave ${key}:`, error)
  }
}

// Función para invalidar múltiples claves que coincidan con un patrón
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const redisAvailable = await isRedisAvailable()
    if (redisAvailable) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        for (const key of keys) {
          await redis.del(key)
        }
        console.log(`Caché invalidada para patrón ${pattern}: ${keys.length} claves`)
      }
    }
  } catch (error) {
    console.error(`Error al invalidar caché para patrón ${pattern}:`, error)
  }
}

export default redis
