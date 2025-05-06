import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { revalidatePath } from "next/cache"
import { serializeDocument } from "@/lib/utils"

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params

  try {
    await connectToDatabase()

    const product = await Product.findById(id).lean()

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

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params

  try {
    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, description, price, image, additionalImages, category, stock, facebookUrl, postSlug } =
      await req.json()

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
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
        category,
        stock: Number(stock) || 0,
        facebookUrl: facebookUrl || "",
        postSlug: postSlug || "",
      },
      { new: true },
    )

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    revalidatePath("/tienda")
    revalidatePath(`/tienda/${id}`)
    revalidatePath("/admin/products")

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await  context.params

  try {
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
