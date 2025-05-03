import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { revalidatePath } from "next/cache"
import { serializeDocument } from "@/lib/utils"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const products = await Product.find().sort({ createdAt: -1 }).lean()

    // Serializar los productos
    const serializedProducts = serializeDocument(products)

    return NextResponse.json({ products: serializedProducts })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, description, price, image, category, stock, facebookUrl, postSlug } = await req.json()

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    await connectToDatabase()

    const product = new Product({
      name,
      description,
      price: Number(price),
      image: image || "/placeholder.svg?height=400&width=400",
      category,
      stock: Number(stock) || 0,
      facebookUrl: facebookUrl || "",
      postSlug: postSlug || "",
    })

    await product.save()

    revalidatePath("/tienda")
    revalidatePath("/admin/products")

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
