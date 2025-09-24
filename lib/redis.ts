import { Redis } from "@upstash/redis"

// Crear una instancia de Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Función para verificar si Redis está disponible
export async function isRedisAvailable(): Promise<boolean> {
  try {
    // Usar un timeout para evitar esperas largas
    const pingPromise = redis.ping()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis timeout')), 2000)
    )
    
    await Promise.race([pingPromise, timeoutPromise])
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
    // Verificar si Redis está disponible con timeout
    const redisAvailable = await isRedisAvailable()

    if (!redisAvailable) {
      console.log(`Redis no disponible, obteniendo datos directamente: ${key}`)
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

    // Guardar en caché para futuras solicitudes (solo si hay datos)
    if (freshData !== null && freshData !== undefined) {
      try {
        await redis.set(key, freshData, { ex: ttl })
      } catch (cacheError) {
        console.warn(`Error al guardar en caché ${key}:`, cacheError)
        // No fallar la función por error de caché
      }
    }

    return freshData
  } catch (error) {
    console.error(`Error en fetchWithCache para clave ${key}:`, error)
    // En caso de error con Redis, obtener datos directamente
    try {
      return await fetchFn()
    } catch (fetchError) {
      console.error(`Error al obtener datos frescos para ${key}:`, fetchError)
      throw fetchError
    }
  }
}

// Función para invalidar una clave específica en la caché
export async function invalidateCache(key: string): Promise<void> {
  try {
    const redisAvailable = await isRedisAvailable()
    if (redisAvailable) {
      await redis.del(key)
      console.log(`Caché invalidada: ${key}`)
    } else {
      console.log(`Redis no disponible, no se puede invalidar: ${key}`)
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
      } else {
        console.log(`No se encontraron claves para el patrón: ${pattern}`)
      }
    } else {
      console.log(`Redis no disponible, no se puede invalidar patrón: ${pattern}`)
    }
  } catch (error) {
    console.error(`Error al invalidar caché para patrón ${pattern}:`, error)
  }
}

export default redis