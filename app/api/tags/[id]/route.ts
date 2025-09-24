// app/api/tags/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Tag } from "@/lib/models/tag"
import { Product } from "@/lib/models/product"
import { revalidatePath } from "next/cache"
import { serializeDocument } from "@/lib/utils"
import mongoose from "mongoose" // Importar mongoose para validación

// Función para generar slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
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

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de etiqueta inválido" }, { status: 400 })
    }

    await connectToDatabase()

    const tag = await Tag.findById(id).lean()

    if (!tag) {
      return NextResponse.json({ error: "Etiqueta no encontrada" }, { status: 404 })
    }

    const serializedTag = serializeDocument(tag)

    return NextResponse.json({ tag: serializedTag })
  } catch (error) {
    console.error("Error al obtener etiqueta:", error)
    return NextResponse.json({ error: "Error al obtener etiqueta" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de etiqueta inválido" }, { status: 400 })
    }

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

    const existingTag = await Tag.findById(id)

    if (!existingTag) {
      return NextResponse.json({ error: "Etiqueta no encontrada" }, { status: 404 })
    }

    // Generar nuevo slug si el nombre cambió
    let slug = existingTag.slug
    if (name !== existingTag.name) {
      const baseSlug = generateSlug(name)
      slug = baseSlug
      let counter = 1

      // Verificar si el slug ya existe (excluyendo la etiqueta actual)
      while (await Tag.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // ✅ NUEVO: Manejar internalId
    let finalInternalId = internalId || existingTag.internalId

    // Si cambió el nombre o tipo, regenerar internalId si no se proporciona uno custom
    if ((name !== existingTag.name || type !== existingTag.type) && !internalId) {
      finalInternalId = generateInternalId(name, type)
    }

    // ✅ NUEVO: Verificar que el internalId sea único (excluyendo el actual)
    if (finalInternalId !== existingTag.internalId) {
      const baseInternalId = finalInternalId
      let counter = 1

      while (await Tag.findOne({ internalId: finalInternalId, _id: { $ne: id } })) {
        finalInternalId = `${baseInternalId}-${counter}`
        counter++
      }
    }

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        internalId: finalInternalId, // ✅ AGREGAR internalId
        description: description || "",
        color: color || "#10b981",
        isVisible: isVisible !== undefined ? isVisible : true,
        priceRange: priceRange || null,
        type,
      },
      { new: true, runValidators: true },
    ).lean()

    revalidatePath("/admin/tags")
    revalidatePath("/tienda")

    const serializedTag = serializeDocument(updatedTag)

    return NextResponse.json({ tag: serializedTag })
  } catch (error) {
    console.error("Error al actualizar etiqueta:", error)

    return NextResponse.json({ error: "Error al actualizar etiqueta" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de etiqueta inválido" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const tag = await Tag.findById(id)

    if (!tag) {
      return NextResponse.json({ error: "Etiqueta no encontrada" }, { status: 404 })
    }

    // Verificar si hay productos usando esta etiqueta
    const productsWithTag = await Product.countDocuments({ tags: id })

    if (productsWithTag > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la etiqueta porque está siendo usada por ${productsWithTag} producto(s)`,
        },
        { status: 400 },
      )
    }

    await Tag.findByIdAndDelete(id)

    revalidatePath("/admin/tags")
    revalidatePath("/tienda")

    return NextResponse.json({ message: "Etiqueta eliminada exitosamente" })
  } catch (error) {
    console.error("Error al eliminar etiqueta:", error)
    return NextResponse.json({ error: "Error al eliminar etiqueta" }, { status: 500 })
  }
}
