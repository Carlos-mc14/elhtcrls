"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ReservationSuccessModal } from "@/components/reservation-success-modal"
import type { FoodEvent, CreateReservationData } from "@/types/food-event"

interface FoodReservationFormProps {
  event: FoodEvent
  onReservationSuccess?: (reservation: any) => void
}

export function FoodReservationForm({ event, onReservationSuccess }: FoodReservationFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    numberOfPlates: 1,
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdReservation, setCreatedReservation] = useState<any>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPlates" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const totalAmount = formData.numberOfPlates * event.pricePerPlate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const reservationData: CreateReservationData = {
        eventId: event._id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        numberOfPlates: formData.numberOfPlates,
        notes: formData.notes || undefined,
      }

      const response = await fetch("/api/food-reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear reserva")
      }

      const reservation = await response.json()
      setCreatedReservation(reservation)
      setShowSuccessModal(true)

      const eventDate = new Date(event.eventDate)
      const message = `¡Hola! He hecho una reserva para el evento "${event.title}":

📅 Fecha: ${eventDate.toLocaleDateString("es-ES")}
👤 Nombre: ${reservation.customerName}
📞 Teléfono: ${reservation.customerPhone}
🍽️ Platos: ${reservation.numberOfPlates}
💰 Total: $${reservation.totalAmount.toLocaleString()}

Por favor confirmen mi reserva. ¡Gracias!`

      const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(message)}`
      if (typeof window !== "undefined") {
        window.open(whatsappUrl, "_blank")
      }

      // Callback opcional para compatibilidad
      onReservationSuccess?.(reservation)

      // Reset form
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        numberOfPlates: 1,
        notes: "",
      })
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear reserva",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReservationClosed = new Date() > new Date(event.reservationDeadline)
  const isEventFull = event.availablePlates === 0

  if (isReservationClosed) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-red-600 mb-2">Reservas Cerradas</h3>
          <p className="text-red-500">El tiempo para hacer reservas ha terminado</p>
        </CardContent>
      </Card>
    )
  }

  if (isEventFull) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-orange-600 mb-2">Evento Completo</h3>
          <p className="text-orange-500">Ya no hay platos disponibles para este evento</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-leaf-dark">Hacer Reserva</CardTitle>
          <p className="text-sm text-gray-600">
            Platos disponibles: <span className="font-semibold text-orange-600">{event.availablePlates}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nombre completo *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Teléfono *</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu número de teléfono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail">Email (opcional)</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="numberOfPlates">Número de platos</Label>
              <Input
                id="numberOfPlates"
                name="numberOfPlates"
                type="number"
                min="1"
                max={event.availablePlates}
                value={formData.numberOfPlates}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Alguna información adicional..."
                rows={3}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total a pagar:</span>
                <span className="text-leaf-dark">${totalAmount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formData.numberOfPlates} plato{formData.numberOfPlates > 1 ? "s" : ""} × $
                {event.pricePerPlate.toLocaleString()}
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-leaf-dark hover:bg-leaf-medium">
              {isSubmitting ? "Procesando..." : "Hacer Reserva"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Al hacer la reserva, te contactaremos por WhatsApp para confirmar los detalles
            </p>
          </form>
        </CardContent>
      </Card>

      {createdReservation && (
        <ReservationSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          reservation={createdReservation}
        />
      )}
    </>
  )
}
