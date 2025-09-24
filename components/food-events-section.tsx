"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Calendar, Clock, Users, DollarSign, ArrowRight, ChefHat } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { FoodEvent } from "@/types/food-event"

export function FoodEventsSection() {
  const [events, setEvents] = useState<FoodEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/food-events?upcoming=true")
        if (response.ok) {
          const data = await response.json()
          setEvents(data.slice(0, 3)) // Mostrar solo los próximos 3 eventos
        }
      } catch (error) {
        console.error("Error fetching food events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return null // No mostrar la sección si no hay eventos
  }

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">Experiencias Gastronómicas</h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Disfruta de deliciosos platos preparados con ingredientes frescos de nuestro huerto mientras exploras
              nuestras plantas
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const eventDate = new Date(event.eventDate)
            const reservationDeadline = new Date(event.reservationDeadline)
            const isReservationOpen = new Date() < reservationDeadline
            const daysUntilEvent = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white">
                  <div className="relative">
                    {event.image ? (
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-orange-500 opacity-50" />
                      </div>
                    )}

                    {/* Badge de estado */}
                    <div className="absolute top-3 left-3">
                      {isReservationOpen ? (
                        <Badge className="bg-green-500 text-white">Reservas Abiertas</Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white">Reservas Cerradas</Badge>
                      )}
                    </div>

                    {/* Badge de días restantes */}
                    {daysUntilEvent > 0 && daysUntilEvent <= 7 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500 text-white">
                          {daysUntilEvent === 1 ? "¡Mañana!" : `En ${daysUntilEvent} días`}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span>
                          {eventDate.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
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

                    {/* Barra de disponibilidad */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Disponibilidad</span>
                        <span>{Math.round((event.availablePlates / event.maxPlates) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
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
                            : "Hacer Reserva"}
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
              </motion.div>
            )
          })}
        </div>

        {events.length > 0 && (
          <div className="text-center mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link href="/eventos">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white bg-transparent"
                >
                  Ver Todos los Eventos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
