import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models/post"
import { revalidatePath } from "next/cache"
import slugify from "slugify"
import { invalidatePostsCache } from "@/lib/api/posts"
import { serializeDocument } from "@/lib/utils"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { title, content, excerpt, tags, coverImage } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Título y contenido son requeridos" }, { status: 400 })
    }

    await connectToDatabase()

    const baseSlug = slugify(title, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1

    // Verificar si el slug ya existe y generar uno único
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Asegurarse de que el ID del autor sea un ObjectId válido
    const authorId = new mongoose.Types.ObjectId(session.user.id)

    const post = new Post({
      title,
      slug,
      content,
      excerpt: excerpt || "", // Asegurar que excerpt no sea undefined
      tags: tags || [],       // Asegurar que tags no sea undefined
      coverImage: coverImage || "",
      author: authorId,
      diaryEntries: [],
      comments: [],
    })

    // Guardar primero
    const savedPost = await post.save()

    // Hacer populate en una consulta separada para asegurar que funcione
    const populatedPost = await Post.findById(savedPost._id)
      .populate("author", "name image")
      .lean()

    // Invalidar cache DESPUÉS de crear el post
    await invalidatePostsCache(savedPost._id.toString(), savedPost.slug)

    // Invalidar más rutas para asegurar que se actualice la UI
    revalidatePath("/")
    revalidatePath("/posts")
    revalidatePath("/admin/posts")

    const serializedPost = serializeDocument(populatedPost)

    return NextResponse.json({ post: serializedPost }, { status: 201 })
  } catch (error) {
    console.error("Error al crear post:", error)
    return NextResponse.json({ 
      error: "Error al crear la publicación",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const tag = searchParams.get("tag") || ""

    await connectToDatabase()

    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, 
        { content: { $regex: search, $options: "i" } }
      ]
    }

    if (tag) {
      query.tags = tag
    }

    const skip = (page - 1) * limit

    // Usar lean() para mejor performance y asegurar serialización
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name image")
      .lean()

    const total = await Post.countDocuments(query)

    const serializedPosts = serializeDocument(posts)

    return NextResponse.json({
      posts: serializedPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error al obtener posts:", error)
    return NextResponse.json({ 
      error: "Error al obtener publicaciones",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}