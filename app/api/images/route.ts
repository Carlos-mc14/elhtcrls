import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Image } from "@/lib/models/image"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

// Función para limpiar el nombre del archivo para SEO
function cleanFilename(filename: string): string {
  // Eliminar la extensión
  const name = filename.substring(0, filename.lastIndexOf("."))
  const extension = filename.substring(filename.lastIndexOf("."))

  // Reemplazar caracteres no alfanuméricos con guiones
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-") // Reemplazar múltiples guiones con uno solo
    .replace(/^-|-$/g, "") // Eliminar guiones al principio y al final

  return cleanName + extension
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const isPublic = formData.get("isPublic") === "true"
    const tags = formData.get("tags") ? (formData.get("tags") as string).split(",") : []

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    const fileType = file.type
    if (!fileType.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten archivos de imagen" }, { status: 400 })
    }

    // Limpiar el nombre del archivo para SEO
    const cleanedFilename = cleanFilename(file.name)

    // Generar un nombre único basado en el nombre limpio
    const uniqueId = nanoid(8)
    const extension = cleanedFilename.substring(cleanedFilename.lastIndexOf("."))
    const nameWithoutExtension = cleanedFilename.substring(0, cleanedFilename.lastIndexOf("."))
    const filename = `${nameWithoutExtension}-${uniqueId}${extension}`

    // Carpeta virtual para organizar las imágenes por usuario
    const userFolder = `users/${session.user.id}`
    const blobPath = `${userFolder}/${filename}`

    // Subir a Vercel Blob
    const blob = await put(blobPath, file, {
      access: "public",
    })

    // Conectar a la base de datos
    await connectToDatabase()

    // Obtener dimensiones de la imagen (opcional)
    let width = 0
    let height = 0

    try {
      // Crear una imagen temporal para obtener dimensiones
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((resolve) => {
        img.onload = () => {
          width = img.width
          height = img.height
          resolve(null)
        }
      })
    } catch (error) {
      console.error("Error al obtener dimensiones de la imagen:", error)
    }

    // Guardar información de la imagen en la base de datos
    const imageDoc = new Image({
      filename,
      originalName: file.name,
      path: blob.url, // Usar la URL de Vercel Blob
      size: file.size,
      mimetype: file.type,
      user: session.user.id,
      isPublic,
      width: width || 0,
      height: height || 0,
      tags,
      blobUrl: blob.url, // Guardar la URL del blob para referencia
    })

    await imageDoc.save()

    return NextResponse.json({
      success: true,
      image: {
        _id: imageDoc._id,
        path: blob.url,
        filename,
        isPublic,
        width: width || 0,
        height: height || 0,
        tags,
        createdAt: imageDoc.createdAt,
      },
    })
  } catch (error) {
    console.error("Error al subir imagen:", error)
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isPublic = searchParams.get("isPublic")
    const tag = searchParams.get("tag")

    await connectToDatabase()

    const query: any = {}

    // Si se solicitan imágenes públicas, mostrar todas las públicas
    // Si se solicitan imágenes privadas, mostrar solo las del usuario
    if (isPublic === "true") {
      query.isPublic = true
    } else if (isPublic === "false") {
      query.user = session.user.id
    } else {
      // Si no se especifica, mostrar las públicas y las propias del usuario
      query.$or = [{ isPublic: true }, { user: session.user.id }]
    }

    if (tag) {
      query.tags = tag
    }

    const images = await Image.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error al obtener imágenes:", error)
    return NextResponse.json({ error: "Error al obtener imágenes" }, { status: 500 })
  }
}
