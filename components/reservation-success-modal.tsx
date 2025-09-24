"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, MessageCircle, Calendar, Users, DollarSign, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { FoodReservation, FoodEvent } from "@/types/food-event"

interface ReservationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: FoodReservation & { eventId: FoodEvent }
}

export function ReservationSuccessModal({ isOpen, onClose, reservation }: ReservationSuccessModalProps) {
  const [whatsappSent, setWhatsappSent] = useState(false)
  const { toast } = useToast()

  const eventDate = new Date(reservation.eventId.eventDate)

  const whatsappMessage = `¡Hola! He hecho una reserva para el evento "${reservation.eventId.title}":

📅 Fecha: ${eventDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })} a las ${eventDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}

👤 Nombre: ${reservation.customerName}
📞 Teléfono: ${reservation.customerPhone}
🍽️ Platos: ${reservation.numberOfPlates}
💰 Total: $${reservation.totalAmount.toLocaleString()}

${reservation.notes ? `📝 Notas: ${reservation.notes}` : ""}

Por favor confirmen mi reserva. ¡Gracias!

*Reserva ID: ${reservation._id}*`

  const handleSendWhatsApp = () => {
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, "_blank")
    setWhatsappSent(true)
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage)
    toast({
      title: "Mensaje copiado",
      description: "El mensaje ha sido copiado al portapapeles",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            ¡Reserva Creada!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg text-green-800">{reservation.eventId.title}</h3>
                <p className="text-green-600">Reserva #{reservation._id.slice(-6).toUpperCase()}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>
                    {eventDate.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>{reservation.numberOfPlates} platos</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">${reservation.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Tu reserva está <span className="font-semibold text-yellow-600">pendiente de confirmación</span>
            </p>

            <p className="text-xs text-gray-500">
              Te contactaremos pronto para confirmar los detalles. También puedes enviarnos un mensaje por WhatsApp:
            </p>

            <div className="space-y-2">
              <Button onClick={handleSendWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                {whatsappSent ? "Mensaje Enviado" : "Enviar por WhatsApp"}
              </Button>

              <Button onClick={handleCopyMessage} variant="outline" className="w-full bg-transparent">
                <Copy className="mr-2 h-4 w-4" />
                Copiar Mensaje
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
            <p className="font-semibold mb-1">¿Qué sigue?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Revisaremos tu reserva</li>
              <li>Te contactaremos para confirmar</li>
              <li>¡Disfruta tu experiencia gastronómica!</li>
            </ol>
          </div>

          <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
