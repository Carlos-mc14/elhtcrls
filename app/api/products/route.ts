// app/api/products/route.ts

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

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit")
    const sortBy = searchParams.get("sortBy") || "newest"
    const search = searchParams.get("search")
    const category = searchParams.get("category") // Agregar filtro por categoría
    const tags = searchParams.get("tags") // Puede ser un string con IDs separados por coma

    // Construir el query de filtros
    const query: any = {}

    if (tags) {
      const tagIds = tags.split(",").filter((id) => id.trim())
      if (tagIds.length > 0) {
        query.tags = { $in: tagIds }
      }
    }

    if (category) {
      query.category = { $regex: category, $options: "i" }
    }

    // Filtro por búsqueda
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }, // Incluir categoría en búsqueda
      ]
    }

    // Construir el ordenamiento
    let sortOptions: any = {}

    switch (sortBy) {
      case "newest":
        sortOptions = { createdAt: -1 }
        break
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "price-asc":
        sortOptions = { price: 1 }
        break
      case "price-desc":
        sortOptions = { price: -1 }
        break
      case "name":
        sortOptions = { name: 1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }

    let productsQuery = Product.find(query)
      .populate("tags", "name slug color type isVisible priceRange internalId")
      .populate("tagStock.tagId", "name slug color type isVisible priceRange internalId")
      .sort(sortOptions)
      .lean()

    // Aplicar límite si se especifica
    if (limit) {
      productsQuery = productsQuery.limit(Number.parseInt(limit))
    }

    const products = await productsQuery

    // Serializar los productos
    const serializedProducts = serializeDocument(products)

    return NextResponse.json(serializedProducts)
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

    const {
      name,
      description,
      price,
      image,
      additionalImages,
      category,
      stock,
      facebookUrl,
      postSlug,
      tags,
      tagStock,
    } = await req.json()

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (name, description, price, category)" },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const product = new Product({
      name,
      description,
      price: Number(price),
      image: image || "/placeholder.svg?height=400&width=400",
      additionalImages: additionalImages || [],
      category, // Agregar category
      stock: Number(stock) || 0,
      facebookUrl: facebookUrl || "",
      postSlug: postSlug || "",
      tags: tags || [],
      tagStock: tagStock || [],
    })

    await product.save()

    await product.populate("tags", "name slug color type isVisible priceRange internalId")
    await product.populate("tagStock.tagId", "name slug color type isVisible priceRange internalId")

    revalidatePath("/tienda")
    revalidatePath("/admin/products")
    revalidatePath("/") // Revalidar homepage también

    const serializedProduct = serializeDocument(product)

    return NextResponse.json({ product: serializedProduct }, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
