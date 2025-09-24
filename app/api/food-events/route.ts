import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { FoodEvent } from "@/lib/models/food-event"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { serializeDocument } from "@/lib/utils"
import { revalidatePath } from "next/cache"

// GET - Obtener eventos gastronómicos
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"
    const upcoming = searchParams.get("upcoming") === "true"

    const query: any = {}

    if (!includeInactive) {
      query.isActive = true
    }

    if (upcoming) {
      query.eventDate = { $gte: new Date() }
    }

    const events = await FoodEvent.find(query).sort({ eventDate: 1 }).lean()

    const serializedEvents = serializeDocument(events)

    return NextResponse.json(serializedEvents)
  } catch (error) {
    console.error("Error fetching food events:", error)
    return NextResponse.json({ error: "Error al obtener eventos gastronómicos" }, { status: 500 })
  }
}

// POST - Crear nuevo evento gastronómico (solo admins)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const data = await request.json()

    // Validar que la fecha límite de reserva sea antes del evento
    const eventDate = new Date(data.eventDate)
    const reservationDeadline = new Date(data.reservationDeadline)

    if (reservationDeadline >= eventDate) {
      return NextResponse.json({ error: "La fecha límite de reserva debe ser anterior al evento" }, { status: 400 })
    }

    const newEvent = new FoodEvent({
      ...data,
      availablePlates: data.maxPlates, // Inicialmente todos los platos están disponibles
    })

    await newEvent.save()

    revalidatePath("/food-events")
    revalidatePath("/admin/food-events")
    revalidatePath("/")

    const serializedEvent = serializeDocument(newEvent)

    return NextResponse.json(serializedEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating food event:", error)
    return NextResponse.json({ error: "Error al crear evento gastronómico" }, { status: 500 })
  }
}
