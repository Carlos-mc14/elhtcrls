import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models/post"
import { revalidatePath } from "next/cache"
import slugify from "slugify"
import { invalidatePostsCache } from "@/lib/api/posts"

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  // Esperar a que params se resuelva
  const params = await context.params
  const id = params.id

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const post = await Post.findById(id).populate("author", "_id")

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Check if user has permission to edit this post
    if (session.user.role !== "admin" && post.author._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para editar esta publicación" }, { status: 403 })
    }

    const { title, content, excerpt, tags, coverImage } = await req.json()
    const oldSlug = post.slug

    if (title) {
      post.title = title
      post.slug = slugify(title, { lower: true, strict: true })
    }

    if (content) post.content = content
    if (excerpt) post.excerpt = excerpt
    if (tags) post.tags = tags
    if (coverImage !== undefined) post.coverImage = coverImage

    await post.save()

    
    // Invalidar caché
    await invalidatePostsCache(id, post.slug)

    // Si el slug cambió, invalidar también el viejo slug
    if (oldSlug !== post.slug) {
      await invalidatePostsCache(undefined, oldSlug)
    }

    revalidatePath(`/posts/${post.slug}`)
    revalidatePath("/posts")
    revalidatePath("/")

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error al actualizar post:", error)
    return NextResponse.json({ error: "Error al actualizar la publicación" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  // Esperar a que params se resuelva
  const params = await context.params
  const id = params.id

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const post = await Post.findById(id).populate("author", "_id")

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Check if user has permission to delete this post
    if (session.user.role !== "admin" && post.author._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para eliminar esta publicación" }, { status: 403 })
    }

    await Post.findByIdAndDelete(id)

    revalidatePath("/posts")
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar post:", error)
    return NextResponse.json({ error: "Error al eliminar la publicación" }, { status: 500 })
  }
}
