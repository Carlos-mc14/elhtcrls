import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { revalidatePath } from "next/cache"
import { serializeDocument } from "@/lib/utils"
import mongoose from "mongoose" // Importar mongoose para validación

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 })
    }

    await connectToDatabase()

    const product = await Product.findById(id)
      .populate("tags", "name slug color type isVisible priceRange internalId")
      .populate("tagStock.tagId", "name slug color type isVisible priceRange internalId") // Agregar populate para tagStock
      .lean()

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Serializar el producto
    const serializedProduct = serializeDocument(product)

    return NextResponse.json({ product: serializedProduct })
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const {
      name,
      description,
      price,
      image,
      additionalImages,
      stock,
      facebookUrl,
      postSlug,
      tags,
      tagStock,
    } = await req.json()

    if (!name || !description || !price) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (name, description, price, category)" },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: Number(price),
        image: image || "/placeholder.svg?height=400&width=400",
        additionalImages: additionalImages || [],
        stock: Number(stock) || 0,
        facebookUrl: facebookUrl || "",
        postSlug: postSlug || "",
        tags: tags || [],
        tagStock: tagStock || [], // Agregar tagStock
      },
      { new: true, runValidators: true }, // Agregar runValidators
    )
      .populate("tags", "name slug color type isVisible priceRange internalId")
      .populate("tagStock.tagId", "name slug color type isVisible priceRange internalId") // Agregar populate para tagStock
      .lean()

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    revalidatePath("/tienda")
    revalidatePath(`/tienda/${id}`)
    revalidatePath("/admin/products")

    const serializedProduct = serializeDocument(product)

    return NextResponse.json({ product: serializedProduct })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    revalidatePath("/tienda")
    revalidatePath("/admin/products")

    return NextResponse.json({ message: "Producto eliminado exitosamente" }) // Mensaje más descriptivo
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
