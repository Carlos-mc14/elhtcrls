import { getFoodEvents } from "@/lib/api/food-events"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, DollarSign, ChefHat, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function EventsPage() {
  try {
    const events = await getFoodEvents({ upcoming: true })

    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ChefHat className="h-10 w-10 text-orange-600" />
              <h1 className="text-4xl font-bold text-gray-900">Eventos Gastronómicos</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Disfruta de experiencias culinarias únicas en nuestro huerto. Cada evento es una oportunidad para degustar
              platos preparados con ingredientes frescos mientras conoces nuestras plantas.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">No hay eventos próximos</h2>
              <p className="text-gray-500">
                Mantente atento a nuestras redes sociales para conocer los próximos eventos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const eventDate = new Date(event.eventDate)
                const reservationDeadline = new Date(event.reservationDeadline)
                const isReservationOpen = new Date() < reservationDeadline
                const daysUntilEvent = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <Card
                    key={event._id}
                    className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white"
                  >
                    <div className="relative">
                      {event.image ? (
                        <div className="aspect-video relative overflow-hidden">
                          <Image
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                          <ChefHat className="h-16 w-16 text-orange-500 opacity-50" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        {isReservationOpen ? (
                          <Badge className="bg-green-500 text-white">Reservas Abiertas</Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white">Reservas Cerradas</Badge>
                        )}
                      </div>

                      {daysUntilEvent > 0 && daysUntilEvent <= 7 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-orange-500 text-white">
                            {daysUntilEvent === 1 ? "¡Mañana!" : `En ${daysUntilEvent} días`}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <h2 className="font-bold text-xl text-gray-900 mb-3">{event.title}</h2>
                      <p className="text-gray-600 mb-4">{event.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span>
                            {eventDate.toLocaleDateString("es-ES", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span>
                            {eventDate.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold">${event.pricePerPlate.toLocaleString()} por plato</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-orange-600" />
                          <span>
                            {event.availablePlates} de {event.maxPlates} platos disponibles
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Disponibilidad</span>
                          <span>{Math.round((event.availablePlates / event.maxPlates) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                            style={{
                              width: `${(event.availablePlates / event.maxPlates) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <Link href={`/eventos/${event._id}`}>
                        <Button
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                          disabled={!isReservationOpen || event.availablePlates === 0}
                        >
                          {!isReservationOpen
                            ? "Reservas Cerradas"
                            : event.availablePlates === 0
                              ? "Agotado"
                              : "Ver Detalles y Reservar"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>

                      {isReservationOpen && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Reservas hasta el{" "}
                          {reservationDeadline.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading events:", error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-500">Error al cargar los eventos gastronómicos</p>
        </div>
      </div>
    )
  }
}

export const metadata = {
  title: "Eventos Gastronómicos - El Huerto de Carlos",
  description: "Disfruta de experiencias culinarias únicas en nuestro huerto con ingredientes frescos",
}