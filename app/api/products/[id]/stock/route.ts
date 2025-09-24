import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { getReservedQuantity } from "@/lib/cart-redis"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { quantity, selectedTags } = await request.json()

    await connectToDatabase()

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ message: `Producto no encontrado` }, { status: 404 })
    }

    // Verificar stock general
    if (product.stock < quantity) {
      return NextResponse.json({ message: `Stock insuficiente para ${product.name}` }, { status: 400 })
    }

    // Verificar stock reservado por otros carritos
    const reservedQuantity = await getReservedQuantity(params.id, selectedTags || [])
    const availableStock = product.stock - reservedQuantity

    if (availableStock < quantity) {
      return NextResponse.json(
        { message: `Stock insuficiente para ${product.name} (reservado por otros clientes)` },
        { status: 400 },
      )
    }

    return NextResponse.json({
      available: true,
      stock: product.stock,
      reserved: reservedQuantity,
      available_stock: availableStock,
    })
  } catch (error) {
    console.error("Error checking stock:", error)
    return NextResponse.json({ message: "Error al verificar stock" }, { status: 500 })
  }
}
