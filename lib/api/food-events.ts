import type { FoodEvent, CreateFoodEventData } from "@/types/food-event"

const API_BASE = "/api/food-events"

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Client-side
    return ""
  }
  // Server-side
  return process.env.NEXT_PUBLIC_APP_URL
}

export async function getFoodEvents(options?: {
  includeInactive?: boolean
  upcoming?: boolean
}): Promise<FoodEvent[]> {
  const params = new URLSearchParams()

  if (options?.includeInactive) {
    params.append("includeInactive", "true")
  }

  if (options?.upcoming) {
    params.append("upcoming", "true")
  }

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE
  const fullUrl = `${getBaseUrl()}${url}`

  const response = await fetch(fullUrl, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Error al obtener eventos gastronómicos")
  }

  return response.json()
}

export async function getFoodEvent(id: string): Promise<FoodEvent> {
  const fullUrl = `${getBaseUrl()}${API_BASE}/${id}`

  const response = await fetch(fullUrl, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Error al obtener evento")
  }

  return response.json()
}

export async function createFoodEvent(data: CreateFoodEventData): Promise<FoodEvent> {
  const fullUrl = `${getBaseUrl()}${API_BASE}`

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al crear evento")
  }

  return response.json()
}

export async function updateFoodEvent(id: string, data: Partial<CreateFoodEventData>): Promise<FoodEvent> {
  const fullUrl = `${getBaseUrl()}${API_BASE}/${id}`

  const response = await fetch(fullUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al actualizar evento")
  }

  return response.json()
}

export async function deleteFoodEvent(id: string): Promise<void> {
  const fullUrl = `${getBaseUrl()}${API_BASE}/${id}`

  const response = await fetch(fullUrl, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al eliminar evento")
  }
}
