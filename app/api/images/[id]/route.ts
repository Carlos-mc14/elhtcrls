import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Image, type IImage } from "@/lib/models/image"
import { del } from "@vercel/blob"

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = context.params.id

    await connectToDatabase()

    // Especificamos el tipo de retorno como IImage | null
    const image = (await Image.findById(id).lean()) as IImage | null

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    // Verificar si la imagen es pública o pertenece al usuario
    const session = await getServerSession(authOptions)
    if (!image.isPublic && (!session || image.user?.toString() !== session.user.id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error al obtener imagen:", error)
    return NextResponse.json({ error: "Error al obtener imagen" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Especificamos el tipo de retorno como IImage | null
    const image = (await Image.findById(id)) as IImage | null

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    // Verificar si la imagen pertenece al usuario o es admin
    if (image.user?.toString() !== session.user.id && session.user.role !== "admin") {
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
  try {
    const id = context.params.id
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Especificamos el tipo de retorno como IImage | null
    const image = (await Image.findById(id)) as IImage | null

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    // Verificar si la imagen pertenece al usuario o es admin
    if (image.user?.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Eliminar el blob si existe una URL de blob
    if (image.blobUrl) {
      try {
        await del(image.blobUrl)
      } catch (blobError) {
        console.error("Error al eliminar blob:", blobError)
        // Continuamos incluso si no se puede eliminar el blob
      }
    }

    // Eliminar el registro de la base de datos
    await Image.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar imagen:", error)
    return NextResponse.json({ error: "Error al eliminar imagen" }, { status: 500 })
  }
}
