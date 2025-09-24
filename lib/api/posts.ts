import { cache } from "react"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models/post"
import { fetchWithCache, invalidateCache, invalidateCachePattern } from "@/lib/redis"
import { serializeDocument } from "@/lib/utils"

// Función auxiliar para convertir _id de MongoDB a string y manejar fechas
function convertMongoIds(obj: any): any {
  if (!obj) return obj

  // Si es un array, convertir cada elemento
  if (Array.isArray(obj)) {
    return obj.map((item) => convertMongoIds(item))
  }

  // Si es un objeto, procesar sus propiedades
  if (typeof obj === "object") {
    const result: any = {}

    for (const key in obj) {
      // Convertir _id a string
      if (key === "_id") {
        result._id = obj._id.toString()
      }
      // Convertir fechas a strings ISO
      else if (obj[key] instanceof Date) {
        result[key] = obj[key].toISOString()
      }
      // Procesar objetos anidados
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        result[key] = convertMongoIds(obj[key])
      }
      // Copiar valores primitivos
      else {
        result[key] = obj[key]
      }
    }

    return result
  }

  return obj
}

// Función para generar clave de caché para posts
function getPostsCacheKey(params: any = {}) {
  const { page = 1, limit = 10, search = "", tag = "" } = params
  return `posts:list:page=${page}:limit=${limit}:search=${search}:tag=${tag}`
}

export const getPosts = cache(async ({ page = 1, limit = 10, search = "", tag = "", withPagination = false } = {}) => {
  const cacheKey = getPostsCacheKey({ page, limit, search, tag })

  return fetchWithCache(
    cacheKey,
    async () => {
      try {
        await connectToDatabase()

        const query: any = {}

        if (search) {
          query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
        }

        if (tag) {
          query.tags = tag
        }

        const skip = (page - 1) * limit

        const posts = await Post.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("author", "name image")
          .lean()

        const serializedPosts = serializeDocument(posts)

        if (withPagination) {
          const total = await Post.countDocuments(query)
          return {
            posts: serializedPosts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
          }
        }

        return serializedPosts
      } catch (error) {
        console.error("Error fetching posts:", error)
        return withPagination ? { posts: [], totalPages: 0, currentPage: page } : []
      }
    },
    60 * 5, // TTL: 5 minutos
  )
})

export const getPostBySlug = cache(async (slug: string) => {
  const cacheKey = `posts:slug:${slug}`

  return fetchWithCache(
    cacheKey,
    async () => {
      try {
        await connectToDatabase()

        const post = await Post.findOne({ slug })
          .populate("author", "name image")
          .populate({
            path: "comments",
            populate: {
              path: "author",
              select: "name image",
            },
          })
          .lean()

        return post ? serializeDocument(post) : null
      } catch (error) {
        console.error("Error fetching post by slug:", error)
        return null
      }
    },
    60 * 10, // TTL: 10 minutos
  )
})

export const getPostById = cache(async (id: string) => {
  const cacheKey = `posts:id:${id}`

  return fetchWithCache(
    cacheKey,
    async () => {
      try {
        await connectToDatabase()

        const post = await Post.findById(id).populate("author", "name image").lean()

        return post ? serializeDocument(post) : null
      } catch (error) {
        console.error("Error fetching post by id:", error)
        return null
      }
    },
    60 * 10, // TTL: 10 minutos
  )
})

export const getPostsForAdmin = cache(async (userId: string, isAdmin: boolean) => {
  const cacheKey = `posts:admin:${userId}:${isAdmin}`

  return fetchWithCache(
    cacheKey,
    async () => {
      try {
        await connectToDatabase()

        const query = isAdmin ? {} : { author: userId }

        const posts = await Post.find(query)
          .sort({ createdAt: -1 })
          .populate("author", "name")
          .select("title slug createdAt isCompleted")
          .lean()

        return serializeDocument(posts)
      } catch (error) {
        console.error("Error fetching posts for admin:", error)
        return []
      }
    },
    60 * 2, // TTL: 2 minutos (más corto para datos administrativos)
  )
})

// Función para invalidar caché después de modificaciones
export async function invalidatePostsCache(postId?: string, slug?: string) {
  // Invalidar listas de posts
  await invalidateCachePattern("posts:list:*")

  // Invalidar post específico si se proporciona ID o slug
  if (postId) {
    await invalidateCache(`posts:id:${postId}`)
  }

  if (slug) {
    await invalidateCache(`posts:slug:${slug}`)
  }

  // Invalidar datos administrativos
  await invalidateCachePattern("posts:admin:*")
}
