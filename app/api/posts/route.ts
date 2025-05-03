import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models/post"
import { revalidatePath } from "next/cache"
import slugify from "slugify"
import { invalidatePostsCache } from "@/lib/api/posts"
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

    const slug = slugify(title, { lower: true, strict: true })

    // Asegurarse de que el ID del autor sea un ObjectId válido
    const authorId = new mongoose.Types.ObjectId(session.user.id)

    const post = new Post({
      title,
      slug,
      content,
      excerpt,
      tags,
      coverImage,
      author: authorId, // Asignar el ID del autor correctamente
      diaryEntries: [],
      comments: [],
    })

    await post.save()

    // Invalidar caché
    await invalidatePostsCache(post._id.toString(), post.slug)

    revalidatePath("/")
    revalidatePath("/posts")

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error al crear post:", error)
    return NextResponse.json({ error: "Error al crear la publicación" }, { status: 500 })
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

    const total = await Post.countDocuments(query)

    return NextResponse.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error al obtener posts:", error)
    return NextResponse.json({ error: "Error al obtener publicaciones" }, { status: 500 })
  }
}
