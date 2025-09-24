import { Redis } from "@upstash/redis"

// Validar variables de entorno
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Variables de entorno Redis no configuradas:', {
    hasUrl: !!UPSTASH_REDIS_REST_URL,
    hasToken: !!UPSTASH_REDIS_REST_TOKEN
  })
}

// Crear una instancia de Redis solo si tenemos las credenciales
let redis: Redis | null = null

try {
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
      // Configuración adicional para Vercel
      retry: {
        retries: 3,
        backoff: (retryCount) => Math.exp(retryCount) * 50
      }
    })
  }
} catch (error) {
  console.error('Error al inicializar Redis:', error)
  redis = null
}

// Función para verificar si Redis está disponible
export async function isRedisAvailable(): Promise<boolean> {
  if (!redis) {
    return false
  }

  try {
    // Crear promises con timeout más corto para Vercel
    const pingPromise = redis.ping()
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Redis timeout')), 1500)
    )
    
    await Promise.race([pingPromise, timeoutPromise])
    return true
  } catch (error) {
    console.warn("Redis no está disponible:", error instanceof Error ? error.message : 'Error desconocido')
    return false
  }
}

// Función genérica para obtener datos de la caché o de la fuente original
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 60 * 60, // 1 hora por defecto
): Promise<T> {
  // Si Redis no está inicializado, obtener datos directamente
  if (!redis) {
    console.log(`Redis no inicializado, obteniendo datos directamente: ${key}`)
    return await fetchFn()
  }

  try {
    // Verificar disponibilidad con timeout corto
    const redisAvailable = await isRedisAvailable()

    if (!redisAvailable) {
      console.log(`Redis no disponible, obteniendo datos directamente: ${key}`)
      return await fetchFn()
    }

    // Intentar obtener datos de la caché con timeout
    let cachedData: T | null = null
    try {
      const cachePromise = redis.get<T>(key)
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Cache timeout')), 1000)
      )
      
      cachedData = await Promise.race([cachePromise, timeoutPromise])
    } catch (cacheError) {
      console.warn(`Error al leer caché ${key}:`, cacheError)
    }

    if (cachedData !== null) {
      console.log(`Datos obtenidos de caché: ${key}`)
      return cachedData
    }

    // Si no hay datos en caché, obtenerlos de la fuente original
    console.log(`Obteniendo datos frescos: ${key}`)
    const freshData = await fetchFn()

    // Guardar en caché para futuras solicitudes (solo si hay datos y Redis disponible)
    if (freshData !== null && freshData !== undefined) {
      try {
        // Operación de escritura con timeout
        const setPromise = redis.set(key, freshData, { ex: ttl })
        const timeoutPromise = new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Set timeout')), 1000)
        )
        
        await Promise.race([setPromise, timeoutPromise])
        console.log(`Datos guardados en caché: ${key}`)
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
  if (!redis) {
    console.log(`Redis no inicializado, no se puede invalidar: ${key}`)
    return
  }

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
  if (!redis) {
    console.log(`Redis no inicializado, no se puede invalidar patrón: ${pattern}`)
    return
  }

  try {
    const redisAvailable = await isRedisAvailable()
    if (redisAvailable) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        // Eliminar claves en lotes para evitar timeouts
        const batchSize = 10
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize)
          await Promise.all(batch.map(key => redis!.del(key)))
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

// Función de utilidad para verificar configuración
export function getRedisStatus() {
  return {
    initialized: !!redis,
    hasUrl: !!UPSTASH_REDIS_REST_URL,
    hasToken: !!UPSTASH_REDIS_REST_TOKEN,
    urlPreview: UPSTASH_REDIS_REST_URL ? `${UPSTASH_REDIS_REST_URL.substring(0, 20)}...` : 'No configurada'
  }
}

export default redis