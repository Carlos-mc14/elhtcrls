import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Image } from "@/lib/models/image"
import { unlink } from "fs/promises"
import path from "path"

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  // Esperar a que params se resuelva
  const params = await context.params
  const id = params.id

  try {
    await connectToDatabase()

    const image = await Image.findById(id).lean() as { isPublic: boolean; user: { toString: () => string }; [key: string]: any } | null

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    // Verificar si la imagen es pública o pertenece al usuario
    const session = await getServerSession(authOptions)
    if (!image.isPublic && (!session || image.user.toString() !== session.user.id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error al obtener imagen:", error)
    return NextResponse.json({ error: "Error al obtener imagen" }, { status: 500 })
  }
}

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

    const image = await Image.findById(id)

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    // Verificar si la imagen pertenece al usuario
    if (image.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { isPublic, tags } = await req.json()

    if (typeof isPublic === "boolean") {
      image.isPublic = isPublic
    }

    if (tags && Array.isArray(tags)) {
      image.tags = tags
    }

    await image.save()

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error al actualizar imagen:", error)
    return NextResponse.json({ error: "Error al actualizar imagen" }, { status: 500 })
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

    const image = await Image.findById(id)

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    // Verificar si la imagen pertenece al usuario o es admin
    if (image.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Eliminar el archivo físico
    try {
      const filePath = path.join(process.cwd(), "public", image.path.substring(1))
      await unlink(filePath)
    } catch (error) {
      console.error("Error al eliminar archivo físico:", error)
      // Continuamos incluso si no se puede eliminar el archivo físico
    }

    // Eliminar el registro de la base de datos
    await Image.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar imagen:", error)
    return NextResponse.json({ error: "Error al eliminar imagen" }, { status: 500 })
  }
}
