import type { FoodReservation, CreateReservationData } from "@/types/food-event"

const API_BASE = "/api/food-reservations"

export async function getFoodReservations(options?: {
  eventId?: string
  status?: string
}): Promise<FoodReservation[]> {
  const params = new URLSearchParams()

  if (options?.eventId) {
    params.append("eventId", options.eventId)
  }

  if (options?.status) {
    params.append("status", options.status)
  }

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE

  const response = await fetch(url, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Error al obtener reservas")
  }

  return response.json()
}

export async function getFoodReservation(id: string): Promise<FoodReservation> {
  const response = await fetch(`${API_BASE}/${id}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Error al obtener reserva")
  }

  return response.json()
}

export async function createFoodReservation(data: CreateReservationData): Promise<FoodReservation> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al crear reserva")
  }

  return response.json()
}

export async function updateFoodReservation(id: string, data: Partial<FoodReservation>): Promise<FoodReservation> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al actualizar reserva")
  }

  return response.json()
}

export async function deleteFoodReservation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al eliminar reserva")
  }
}
