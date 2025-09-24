export interface FoodEvent {
  _id: string
  title: string
  description: string
  eventDate: string
  reservationDeadline: string
  pricePerPlate: number
  maxPlates: number
  availablePlates: number
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FoodReservation {
  _id: string
  eventId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  numberOfPlates: number
  totalAmount: number
  status: "pending" | "confirmed" | "cancelled"
  whatsappMessageSent: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFoodEventData {
  title: string
  description: string
  eventDate: string
  reservationDeadline: string
  pricePerPlate: number
  maxPlates: number
  image?: string
}

export interface CreateReservationData {
  eventId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  numberOfPlates: number
  notes?: string
}
