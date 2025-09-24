import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { quantity, tagId } = await request.json()
    const params = await context.params

    await connectToDatabase()

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ message: `Producto no encontrado` }, { status: 404 })
    }

    if (tagId) {
      // Reduce stock for specific tag
      const tagStockIndex = product.tagStock?.findIndex((ts: any) => ts.tagId.toString() === tagId)
      if (tagStockIndex !== undefined && tagStockIndex >= 0 && product.tagStock) {
        product.tagStock[tagStockIndex].stock = Math.max(0, product.tagStock[tagStockIndex].stock - quantity)
      }
    } else {
      // Reduce general stock
      product.stock = Math.max(0, product.stock - quantity)
    }

    await product.save()

    return NextResponse.json({
      success: true,
      new_stock: tagId ? product.tagStock?.find((ts: any) => ts.tagId.toString() === tagId)?.stock : product.stock,
    })
  } catch (error) {
    console.error("Error reducing stock:", error)
    return NextResponse.json({ message: "Error al reducir stock" }, { status: 500 })
  }
}
