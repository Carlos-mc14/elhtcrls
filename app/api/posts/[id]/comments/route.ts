import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models/post"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  // Esperar a que params se resuelva
  const params = context.params
  const id = params.id

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 })
    }

    await connectToDatabase()

    const post = await Post.findById(id)

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    post.comments.push({
      content,
      author: session.user.id,
      createdAt: new Date(),
    })

    await post.save()

    // Populate the author of the new comment
    const populatedPost = await Post.findById(id)
      .populate({
        path: "comments.author",
        select: "name image",
      })
      .lean() as { comments: { author: { name: string; image: string }; content: string; createdAt: Date }[] } | null

    if (!populatedPost || !populatedPost.comments) {
      return NextResponse.json({ error: "Error al procesar los comentarios" }, { status: 500 })
    }

    const newComment = populatedPost.comments[populatedPost.comments.length - 1]

    // Convertir a formato serializable
    const serializedComment = JSON.parse(JSON.stringify(newComment))

    revalidatePath(`/posts/${post.slug}`)

    return NextResponse.json({ comment: serializedComment }, { status: 201 })
  } catch (error) {
    console.error("Error al añadir comentario:", error)
    return NextResponse.json({ error: "Error al añadir comentario" }, { status: 500 })
  }
}
