import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { FoodReservation } from "@/lib/models/food-reservation"
import { FoodEvent } from "@/lib/models/food-event"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { serializeDocument } from "@/lib/utils"
import { revalidatePath } from "next/cache"

// GET - Obtener reserva específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const reservation = await FoodReservation.findById(params.id).populate("eventId", "title eventDate").lean()

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    const serializedReservation = serializeDocument(reservation)

    return NextResponse.json(serializedReservation)
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ error: "Error al obtener reserva" }, { status: 500 })
  }
}

// PUT - Actualizar reserva (solo admins)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const data = await request.json()
    const { status } = data

    const reservation = await FoodReservation.findById(params.id)

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Si se está cancelando una reserva confirmada, devolver platos al evento
    if (reservation.status === "confirmed" && status === "cancelled") {
      const event = await FoodEvent.findById(reservation.eventId)
      if (event) {
        event.availablePlates += reservation.numberOfPlates
        await event.save()
      }
    }

    // Si se está confirmando una reserva pendiente, no hacer nada (ya se descontaron los platos)
    // Si se está confirmando una reserva cancelada, descontar platos del evento
    if (reservation.status === "cancelled" && status === "confirmed") {
      const event = await FoodEvent.findById(reservation.eventId)
      if (event) {
        if (event.availablePlates < reservation.numberOfPlates) {
          return NextResponse.json({ error: "No hay suficientes platos disponibles" }, { status: 400 })
        }
        event.availablePlates -= reservation.numberOfPlates
        await event.save()
      }
    }

    const updatedReservation = await FoodReservation.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    )
      .populate("eventId", "title eventDate")
      .lean()

    revalidatePath("/food-reservations")
    revalidatePath("/admin/food-reservations")
    revalidatePath("/food-events")

    const serializedReservation = serializeDocument(updatedReservation)

    return NextResponse.json(serializedReservation)
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Error al actualizar reserva" }, { status: 500 })
  }
}

// DELETE - Eliminar reserva (solo admins)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const reservation = await FoodReservation.findById(params.id)

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Si la reserva estaba confirmada o pendiente, devolver platos al evento
    if (reservation.status === "confirmed" || reservation.status === "pending") {
      const event = await FoodEvent.findById(reservation.eventId)
      if (event) {
        event.availablePlates += reservation.numberOfPlates
        await event.save()
      }
    }

    await FoodReservation.findByIdAndDelete(params.id)

    revalidatePath("/food-reservations")
    revalidatePath("/admin/food-reservations")
    revalidatePath("/food-events")

    return NextResponse.json({ message: "Reserva eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return NextResponse.json({ error: "Error al eliminar reserva" }, { status: 500 })
  }
}
