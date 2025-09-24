// app/api/tags/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Tag } from "@/lib/models/tag"
import { revalidatePath } from "next/cache"
import { serializeDocument } from "@/lib/utils"

// Función para generar slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remover caracteres especiales
    .replace(/[\s_-]+/g, "-") // Reemplazar espacios y guiones bajos con guiones
    .replace(/^-+|-+$/g, "") // Remover guiones al inicio y final
}

// ✅ NUEVA: Función para generar internalId
function generateInternalId(name: string, type: string): string {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  
  return `${type}-${cleanName}`
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const visible = searchParams.get("visible")
    const search = searchParams.get("search")

    // Construir el query de filtros
    const query: any = {}

    // Filtro por tipo
    if (type) {
      query.type = type
    }

    // Filtro por visibilidad
    if (visible !== null) {
      query.isVisible = visible === "true"
    }

    // Filtro por búsqueda
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } }, 
        { description: { $regex: search, $options: "i" } },
        { internalId: { $regex: search, $options: "i" } } // ✅ AGREGAR búsqueda por internalId
      ]
    }

    const tags = await Tag.find(query).sort({ name: 1 }).lean()

    // Serializar las etiquetas
    const serializedTags = serializeDocument(tags)

    return NextResponse.json({
      tags: serializedTags,
      total: tags.length,
      filters: {
        type,
        visible,
        search,
      },
    })
  } catch (error) {
    console.error("Error al obtener etiquetas:", error)
    return NextResponse.json({ error: "Error al obtener etiquetas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // ✅ CAMBIO: Agregar internalId a la destructuración
    const { name, internalId, description, color, isVisible, priceRange, type } = await req.json()

    if (!name || !type) {
      return NextResponse.json({ error: "Nombre y tipo son requeridos" }, { status: 400 })
    }

    await connectToDatabase()

    // Generar slug único
    const baseSlug = generateSlug(name)
    let slug = baseSlug
    let counter = 1

    // Verificar si el slug ya existe y generar uno único
    while (await Tag.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // ✅ NUEVO: Generar o usar internalId
    let finalInternalId = internalId
    if (!finalInternalId) {
      // Si no se proporciona, generar automáticamente
      finalInternalId = generateInternalId(name, type)
    }

    // ✅ NUEVO: Verificar que el internalId sea único
    let baseInternalId = finalInternalId
    let internalCounter = 1
    
    while (await Tag.findOne({ internalId: finalInternalId })) {
      finalInternalId = `${baseInternalId}-${internalCounter}`
      internalCounter++
    }

    const tag = new Tag({
      name,
      slug,
      internalId: finalInternalId, // ✅ AGREGAR internalId
      description: description || "",
      color: color || "#10b981",
      isVisible: isVisible !== undefined ? isVisible : true,
      priceRange: priceRange || null,
      type,
    })

    await tag.save()

    revalidatePath("/admin/tags")
    revalidatePath("/tienda")

    // ✅ CAMBIO: Serializar la respuesta
    const serializedTag = serializeDocument(tag)

    return NextResponse.json({ tag: serializedTag }, { status: 201 })
  } catch (error) {
    console.error("Error al crear etiqueta:", error)
    
    return NextResponse.json({ error: "Error al crear etiqueta" }, { status: 500 })
  }
}