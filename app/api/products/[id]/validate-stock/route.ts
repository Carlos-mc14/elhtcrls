import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { getReservedQuantity } from "@/lib/cart-redis"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { quantity, selectedTags } = await request.json()
    const params = await context.params

    await connectToDatabase()

    const product = await Product.findById(params.id).populate("tags")
    if (!product) {
      return NextResponse.json({ message: `Producto no encontrado` }, { status: 404 })
    }

    if (selectedTags && selectedTags.length > 0) {
      // Validate stock for specific tags
      for (const tagId of selectedTags) {
        const tagStock = product.tagStock?.find((ts: any) => ts.tagId.toString() === tagId)
        if (!tagStock || tagStock.stock === 0) {
          return NextResponse.json(
            { message: `${product.name} está agotado para el tamaño seleccionado` },
            { status: 400 },
          )
        }

        const reservedQuantity = await getReservedQuantity(params.id, [tagId])
        const availableStock = tagStock.stock - reservedQuantity

        if (availableStock < quantity) {
          return NextResponse.json(
            {
              message: `Stock insuficiente para ${product.name}. Disponible: ${availableStock}, Solicitado: ${quantity}`,
            },
            { status: 400 },
          )
        }
      }
    } else {
      // Validate general stock
      if (product.stock === 0) {
        return NextResponse.json({ message: `${product.name} está agotado` }, { status: 400 })
      }

      const reservedQuantity = await getReservedQuantity(params.id, [])
      const availableStock = product.stock - reservedQuantity

      if (availableStock < quantity) {
        return NextResponse.json(
          {
            message: `Stock insuficiente para ${product.name}. Disponible: ${availableStock}, Solicitado: ${quantity}`,
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error validating stock:", error)
    return NextResponse.json({ message: "Error al validar stock" }, { status: 500 })
  }
}
