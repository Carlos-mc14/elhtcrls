import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { serializeDocument } from "@/lib/utils"
import { getCartFromRedis, saveCartToRedis, reserveStock, validateCartStock, releaseStock } from "@/lib/cart-redis"
import type { Cart } from "@/types/cart"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const cartId = params.id

    if (!cartId) {
      return NextResponse.json({ error: "ID de carrito requerido" }, { status: 400 })
    }

    const cart = await getCartFromRedis(cartId)

    if (!cart) {
      // Return empty cart if not found
      const emptyCart: Cart = {
        id: cartId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return NextResponse.json({ cart: emptyCart })
    }

    const stockValidation = await validateCartStock(cartId)

    return NextResponse.json({
      cart,
      stockValidation,
    })
  } catch (error) {
    console.error("Error al obtener carrito:", error)
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const cartId = params.id
    const { items, customerName, customerPhone } = await request.json()

    if (!cartId || !items) {
      return NextResponse.json({ error: "Datos de carrito requeridos" }, { status: 400 })
    }

    await connectToDatabase()

    // Validar que los productos existen y tienen stock
    const productIds = items.map((item: any) => item.productId)
    const products = await Product.find({ _id: { $in: productIds } })
      .populate("tags", "name slug color type isVisible priceRange internalId")
      .lean()

    const serializedProducts = serializeDocument(products)

    const validatedItems = items.map((item: any) => {
      const product = serializedProducts.find((p: any) => p._id === item.productId)
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`)
      }

      if (product.stock === 0) {
        throw new Error(`${product.name} está agotado`)
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`)
      }

      return {
        ...item,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        totalPrice: item.quantity * product.price,
      }
    })

    const totalItems = validatedItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const totalPrice = validatedItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0)

    const cart: Cart = {
      id: cartId,
      items: validatedItems,
      totalItems,
      totalPrice,
      status: "active",
      customerName,
      customerPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await saveCartToRedis(cart)

    try {
      await reserveStock(cartId, validatedItems)
    } catch (stockError) {
      // If stock reservation fails, still save cart but return warning
      console.warn("Stock reservation failed:", stockError)
      return NextResponse.json({
        cart,
        warning: "Carrito guardado pero algunos productos pueden no estar disponibles",
      })
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error("Error al guardar carrito:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar carrito" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const cartId = params.id

    if (!cartId) {
      return NextResponse.json({ error: "ID de carrito requerido" }, { status: 400 })
    }

    await releaseStock(cartId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al liberar stock del carrito:", error)
    return NextResponse.json({ error: "Error al liberar stock" }, { status: 500 })
  }
}
