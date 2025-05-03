import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Image } from "@/lib/models/image"
import { writeFile, mkdir, access } from "fs/promises"
import path from "path"
import sharp from "sharp"

// Función para asegurar que el directorio existe
async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    console.error("Error creating directory:", error)
  }
}

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

// Función para verificar si un archivo existe
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

// Función para generar un nombre único si ya existe
async function getUniqueFilename(basePath: string, filename: string): Promise<string> {
  const name = filename.substring(0, filename.lastIndexOf("."))
  const extension = filename.substring(filename.lastIndexOf("."))

  let uniqueFilename = filename
  let counter = 1

  while (await fileExists(path.join(basePath, uniqueFilename))) {
    uniqueFilename = `${name}(${counter})${extension}`
    counter++
  }

  return uniqueFilename
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

    // Crear directorios para imágenes
    const publicDir = path.join(process.cwd(), "public")
    const uploadsDir = path.join(publicDir, "uploads")
    const userDir = path.join(uploadsDir, session.user.id)

    await ensureDir(userDir)

    // Limpiar el nombre del archivo para SEO
    const cleanedFilename = cleanFilename(file.name)

    // Verificar si ya existe y obtener un nombre único
    const uniqueFilename = await getUniqueFilename(userDir, cleanedFilename)

    // Ruta completa del archivo
    const filePath = path.join(userDir, uniqueFilename)

    // Convertir el archivo a un Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Procesar la imagen con sharp para obtener dimensiones
    const imageInfo = await sharp(buffer).metadata()

    // Guardar el archivo en el sistema de archivos
    await writeFile(filePath, buffer)

    // Ruta relativa para acceder desde la web
    const relativePath = `/uploads/${session.user.id}/${uniqueFilename}`

    // Conectar a la base de datos
    await connectToDatabase()

    // Guardar información de la imagen en la base de datos
    const image = new Image({
      filename: uniqueFilename,
      originalName: file.name,
      path: relativePath,
      size: file.size,
      mimetype: file.type,
      user: session.user.id,
      isPublic,
      width: imageInfo.width || 0,
      height: imageInfo.height || 0,
      tags,
    })

    await image.save()

    return NextResponse.json({
      success: true,
      image: {
        _id: image._id,
        path: relativePath,
        filename: uniqueFilename,
        isPublic,
        width: imageInfo.width,
        height: imageInfo.height,
        tags,
        createdAt: image.createdAt,
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
