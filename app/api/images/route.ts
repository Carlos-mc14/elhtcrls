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
  const name = filename.substring(0, filename.lastIndexOf(".") !== -1 ? filename.lastIndexOf(".") : filename.length)
  const extension = filename.lastIndexOf(".") !== -1 ? filename.substring(filename.lastIndexOf(".")) : ""

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

    // Aumentar el tiempo de espera para la solicitud
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

    // Validar tamaño del archivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El tamaño máximo permitido es 5MB" }, { status: 400 })
    }

    try {
      // Limpiar el nombre del archivo para SEO
      const cleanedFilename = cleanFilename(file.name)

      // Generar un nombre único basado en el nombre limpio
      const uniqueId = nanoid(8)
      const extension =
        cleanedFilename.lastIndexOf(".") !== -1 ? cleanedFilename.substring(cleanedFilename.lastIndexOf(".")) : ""
      const nameWithoutExtension =
        cleanedFilename.lastIndexOf(".") !== -1
          ? cleanedFilename.substring(0, cleanedFilename.lastIndexOf("."))
          : cleanedFilename
      const filename = `${nameWithoutExtension}-${uniqueId}${extension}`

      // Carpeta virtual para organizar las imágenes por usuario
      const userFolder = `users/${session.user.id}`
      const blobPath = `${userFolder}/${filename}`

      // Subir a Vercel Blob con manejo de errores
      const blob = await put(blobPath, file, {
        access: "public",
      })

      if (!blob || !blob.url) {
        throw new Error("Error al subir la imagen a Vercel Blob")
      }

      // Conectar a la base de datos
      await connectToDatabase()

      // Guardar información de la imagen en la base de datos
      const imageDoc = new Image({
        filename,
        originalName: file.name,
        path: blob.url,
        size: file.size,
        mimetype: file.type,
        user: session.user.id,
        isPublic,
        width: 0,
        height: 0,
        tags,
        blobUrl: blob.url,
      })

      await imageDoc.save()

      return NextResponse.json({
        success: true,
        image: {
          _id: imageDoc._id,
          path: blob.url,
          filename,
          originalName: file.name,
          isPublic,
          width: 0,
          height: 0,
          tags,
          createdAt: imageDoc.createdAt,
        },
      })
    } catch (uploadError) {
      console.error("Error específico al subir:", uploadError)
      return NextResponse.json(
        {
          error: "Error al procesar la imagen",
          details: uploadError instanceof Error ? uploadError.message : String(uploadError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error general al subir imagen:", error)
    return NextResponse.json(
      {
        error: "Error al subir imagen",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
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

    try {
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

      console.log(`Imágenes encontradas: ${images.length}`, query)

      return NextResponse.json({ images })
    } catch (dbError) {
      console.error("Error específico al obtener imágenes de la BD:", dbError)
      return NextResponse.json(
        {
          error: "Error al obtener imágenes de la base de datos",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error general al obtener imágenes:", error)
    return NextResponse.json(
      {
        error: "Error al obtener imágenes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
