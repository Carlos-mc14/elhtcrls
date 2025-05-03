import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models/user"

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  // Esperar a que params se resuelva
  const params = await context.params
  const id = params.id

  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { role } = await req.json()

    if (!role || !["user", "editor", "admin"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password")

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Convertir a formato serializable
    const serializedUser = JSON.parse(JSON.stringify(user))

    return NextResponse.json({ user: serializedUser })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  // Esperar a que params se resuelva
  const params = await context.params
  const id = params.id

  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
