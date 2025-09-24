import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { FoodEvent } from "@/lib/models/food-event"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { serializeDocument } from "@/lib/utils"
import { revalidatePath } from "next/cache"

// GET - Obtener evento específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectToDatabase()

    const event = await FoodEvent.findById(id).lean()

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    const serializedEvent = serializeDocument(event)

    return NextResponse.json(serializedEvent)
  } catch (error) {
    console.error("Error fetching food event:", error)
    return NextResponse.json({ error: "Error al obtener evento" }, { status: 500 })
  }
}

// PUT - Actualizar evento (solo admins)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    await connectToDatabase()

    const data = await request.json()

    // Validar fechas si se están actualizando
    if (data.eventDate && data.reservationDeadline) {
      const eventDate = new Date(data.eventDate)
      const reservationDeadline = new Date(data.reservationDeadline)

      if (reservationDeadline >= eventDate) {
        return NextResponse.json({ error: "La fecha límite de reserva debe ser anterior al evento" }, { status: 400 })
      }
    }

    const updatedEvent = await FoodEvent.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()

    if (!updatedEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    revalidatePath("/food-events")
    revalidatePath("/admin/food-events")
    revalidatePath("/")

    const serializedEvent = serializeDocument(updatedEvent)

    return NextResponse.json(serializedEvent)
  } catch (error) {
    console.error("Error updating food event:", error)
    return NextResponse.json({ error: "Error al actualizar evento" }, { status: 500 })
  }
}

// DELETE - Eliminar evento (solo admins)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    await connectToDatabase()

    const deletedEvent = await FoodEvent.findByIdAndDelete(id)

    if (!deletedEvent) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    revalidatePath("/food-events")
    revalidatePath("/admin/food-events")
    revalidatePath("/")

    return NextResponse.json({ message: "Evento eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting food event:", error)
    return NextResponse.json({ error: "Error al eliminar evento" }, { status: 500 })
  }
}
