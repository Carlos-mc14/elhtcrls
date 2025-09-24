import { notFound } from "next/navigation"
import Image from "next/image"
import { getFoodEvent } from "@/lib/api/food-events"
import { CountdownTimer } from "@/components/countdown-timer"
import { FoodReservationForm } from "@/components/food-reservation-form"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Users, DollarSign, MapPin } from "lucide-react"

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    const awaitedParams = await params
    const event = await getFoodEvent(awaitedParams.id)

    if (!event || !event.isActive) {
      notFound()
    }

    const eventDate = new Date(event.eventDate)
    const reservationDeadline = new Date(event.reservationDeadline)
    const isReservationOpen = new Date() < reservationDeadline

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-leaf-dark mb-4">{event.title}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Imagen del evento */}
            <div className="space-y-6">
              {event.image && (
                <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                  <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                </div>
              )}

              {/* Información del evento */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-leaf-dark mb-4">Detalles del Evento</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold">Fecha del evento</p>
                        <p className="text-gray-600">
                          {eventDate.toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold">Hora</p>
                        <p className="text-gray-600">
                          {eventDate.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold">Precio por plato</p>
                        <p className="text-gray-600">${event.pricePerPlate.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold">Disponibilidad</p>
                        <p className="text-gray-600">
                          {event.availablePlates} de {event.maxPlates} platos disponibles
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold">Ubicación</p>
                        <p className="text-gray-600">El Huerto de Carlos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulario de reserva y contador */}
            <div className="space-y-6">
              {isReservationOpen && <CountdownTimer targetDate={event.reservationDeadline} />}

              <FoodReservationForm event={event} />
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-12 text-center">
            <Card className="bg-leaf-light/10 border-leaf-light">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-leaf-dark mb-3">¿Cómo funciona?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-orange-600 font-bold">1</span>
                    </div>
                    <p className="font-semibold mb-1">Haz tu reserva</p>
                    <p className="text-gray-600">Completa el formulario con tus datos</p>
                  </div>
                  <div>
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-orange-600 font-bold">2</span>
                    </div>
                    <p className="font-semibold mb-1">Confirmación</p>
                    <p className="text-gray-600">Te contactaremos por WhatsApp</p>
                  </div>
                  <div>
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-orange-600 font-bold">3</span>
                    </div>
                    <p className="font-semibold mb-1">Disfruta</p>
                    <p className="text-gray-600">Ven el día del evento y disfruta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading event:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: EventPageProps) {
  try {
    const awaitedParams = await params
    const event = await getFoodEvent(awaitedParams.id)
    return {
      title: `${event.title} - El Huerto de Carlos`,
      description: event.description,
    }
  } catch {
    return {
      title: "Evento no encontrado - El Huerto de Carlos",
    }
  }
}
