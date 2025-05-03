import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models/post"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  // Esperar a que params se resuelva
  const params = await context.params
  const id = params.id

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el usuario es admin o editor
    if (!["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No tienes permiso para añadir entradas de diario" }, { status: 403 })
    }

    await connectToDatabase()

    const post = await Post.findById(id).populate("author", "_id")

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Check if user has permission to add diary entries
    if (session.user.role !== "admin" && post.author._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para añadir entradas a esta publicación" }, { status: 403 })
    }

    const { content, images } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 })
    }

    // Calculate day number based on first entry date
    const dayNumber =
      post.diaryEntries.length > 0
        ? Math.ceil((Date.now() - new Date(post.diaryEntries[0].date).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 1

    post.diaryEntries.push({
      content,
      images: images || [],
      date: new Date(),
      dayNumber,
    })

    await post.save()

    revalidatePath(`/posts/${post.slug}`)

    // Convertir a formato serializable
    const diaryEntry = JSON.parse(JSON.stringify(post.diaryEntries[post.diaryEntries.length - 1]))

    return NextResponse.json({ diaryEntry })
  } catch (error) {
    console.error("Error al añadir entrada de diario:", error)
    return NextResponse.json({ error: "Error al añadir entrada de diario" }, { status: 500 })
  }
}
