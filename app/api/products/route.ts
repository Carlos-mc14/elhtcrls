// app/api/products/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { Tag } from "@/lib/models/tag" // AGREGAR esta importación
import { revalidatePath } from "next/cache"
import { serializeDocument } from "@/lib/utils"

// REMOVER configuraciones conflictivas de cache
// export const dynamic = "force-dynamic"
// export const revalidate = 0
// export const fetchCache = "force-no-store"

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/products called") // Debug log
    
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit")
    const sortBy = searchParams.get("sortBy") || "newest"
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const tags = searchParams.get("tags")

    console.log("Search params:", { limit, sortBy, search, category, tags }) // Debug

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
        { category: { $regex: search, $options: "i" } },
      ]
    }

    console.log("MongoDB query:", JSON.stringify(query)) // Debug

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
      // Comentar populate temporalmente si no tienes modelo Tag
      // .populate("tags", "name slug color type isVisible priceRange internalId")
      // .populate("tagStock.tagId", "name slug color type isVisible priceRange internalId")
      .sort(sortOptions)
      .lean()

    // Aplicar límite si se especifica
    if (limit) {
      productsQuery = productsQuery.limit(Number.parseInt(limit))
    }

    const products = await productsQuery

    console.log(`Found ${products.length} products`) // Debug log

    // Serializar los productos
    const serializedProducts = serializeDocument(products)

    console.log(`Returning ${serializedProducts.length} serialized products`) // Debug

    return NextResponse.json(serializedProducts)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ 
      error: "Error al obtener productos",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/products called") // Debug log
    
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

    console.log("Product data received:", { name, category, price, stock }) // Debug

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
      category,
      stock: Number(stock) || 0,
      facebookUrl: facebookUrl || "",
      postSlug: postSlug || "",
      tags: tags || [],
      tagStock: tagStock || [],
    })

    console.log("Saving product...") // Debug

    const savedProduct = await product.save()

    console.log("Product saved with ID:", savedProduct._id) // Debug

    // Hacer populate en una consulta separada para asegurar que funcione
    const populatedProduct = await Product.findById(savedProduct._id)
      // Comentar populate temporalmente si no tienes modelo Tag
      // .populate("tags", "name slug color type isVisible priceRange internalId")
      // .populate("tagStock.tagId", "name slug color type isVisible priceRange internalId")
      .lean()

    console.log("Product populated successfully") // Debug

    // Revalidar rutas importantes
    revalidatePath("/tienda")
    revalidatePath("/admin/products")
    revalidatePath("/")

    const serializedProduct = serializeDocument(populatedProduct)

    console.log("Product creation completed") // Debug

    return NextResponse.json({ product: serializedProduct }, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ 
      error: "Error al crear producto",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
}