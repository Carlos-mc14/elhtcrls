import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { FoodReservation } from "@/lib/models/food-reservation"
import { FoodEvent } from "@/lib/models/food-event"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { serializeDocument } from "@/lib/utils"
import { revalidatePath } from "next/cache"

// GET - Obtener reservas (solo admins)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const status = searchParams.get("status")

    const query: any = {}

    if (eventId) {
      query.eventId = eventId
    }

    if (status) {
      query.status = status
    }

    const reservations = await FoodReservation.find(query)
      .populate("eventId", "title eventDate")
      .sort({ createdAt: -1 })
      .lean()

    const serializedReservations = serializeDocument(reservations)

    return NextResponse.json(serializedReservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 })
  }
}

// POST - Crear nueva reserva
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { eventId, numberOfPlates } = data

    // Verificar que el evento existe y está activo
    const event = await FoodEvent.findById(eventId)

    if (!event || !event.isActive) {
      return NextResponse.json({ error: "Evento no encontrado o inactivo" }, { status: 404 })
    }

    // Verificar que no se haya pasado la fecha límite de reserva
    const now = new Date()
    if (now > event.reservationDeadline) {
      return NextResponse.json({ error: "La fecha límite para reservas ha pasado" }, { status: 400 })
    }

    // Verificar disponibilidad
    if (event.availablePlates < numberOfPlates) {
      return NextResponse.json({ error: `Solo quedan ${event.availablePlates} platos disponibles` }, { status: 400 })
    }

    // Calcular total
    const totalAmount = event.pricePerPlate * numberOfPlates

    // Crear reserva
    const newReservation = new FoodReservation({
      ...data,
      totalAmount,
    })

    await newReservation.save()

    // Actualizar platos disponibles
    event.availablePlates -= numberOfPlates
    await event.save()

    // Poblar datos del evento para la respuesta
    await newReservation.populate("eventId", "title eventDate pricePerPlate")

    revalidatePath("/food-reservations")
    revalidatePath("/admin/food-reservations")
    revalidatePath("/food-events")

    const serializedReservation = serializeDocument(newReservation)

    return NextResponse.json(serializedReservation, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Error al crear reserva" }, { status: 500 })
  }
}
