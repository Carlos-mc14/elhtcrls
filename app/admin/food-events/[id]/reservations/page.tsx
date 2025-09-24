"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Search, MoreHorizontal, Check, X, MessageCircle, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import type { FoodReservation, FoodEvent } from "@/types/food-event"

interface ReservationWithEvent extends FoodReservation {
  event: FoodEvent
}

export default function EventReservationsPage({ params }: { params: { id: string } }) {
  const [reservations, setReservations] = useState<ReservationWithEvent[]>([])
  const [event, setEvent] = useState<FoodEvent | null>(null)
  const [filteredReservations, setFilteredReservations] = useState<ReservationWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchEventAndReservations()
  }, [params.id])

  useEffect(() => {
    const filtered = reservations.filter(
      (reservation) =>
        reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customerPhone.includes(searchTerm),
    )
    setFilteredReservations(filtered)
  }, [reservations, searchTerm])

  const fetchEventAndReservations = async () => {
    try {
      // Obtener evento
      const eventResponse = await fetch(`/api/food-events/${params.id}`)
      if (eventResponse.ok) {
        const eventData = await eventResponse.json()
        setEvent(eventData)
      }

      // Obtener reservas
      const reservationsResponse = await fetch(`/api/food-reservations?eventId=${params.id}`)
      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json()
        setReservations(reservationsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Error al cargar datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (reservationId: string, status: "confirmed" | "cancelled") => {
    try {
      const response = await fetch(`/api/food-reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Reserva ${status === "confirmed" ? "confirmada" : "cancelada"} correctamente`,
        })
        fetchEventAndReservations()
      } else {
        throw new Error("Error al actualizar reserva")
      }
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast({
        title: "Error",
        description: "Error al actualizar reserva",
        variant: "destructive",
      })
    }
  }

  const sendWhatsAppMessage = (reservation: ReservationWithEvent) => {
    const message = `Hola ${reservation.customerName}! 

Tu reserva para "${event?.title}" ha sido confirmada:

📅 Fecha: ${new Date(event?.eventDate || "").toLocaleDateString("es-ES")}
🍽️ Platos: ${reservation.numberOfPlates}
💰 Total: $${reservation.totalAmount.toLocaleString()}

¡Te esperamos en El Huerto de Carlos!`

    const whatsappUrl = `https://wa.me/${reservation.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500 text-white">Confirmada</Badge>
      case "cancelled":
        return <Badge className="bg-red-500 text-white">Cancelada</Badge>
      default:
        return <Badge className="bg-yellow-500 text-white">Pendiente</Badge>
    }
  }

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    pending: reservations.filter((r) => r.status === "pending").length,
    totalRevenue: reservations.filter((r) => r.status === "confirmed").reduce((sum, r) => sum + r.totalAmount, 0),
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/food-events">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Cargando...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/food-events">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Reservas del Evento</h1>
          <p className="text-gray-600">{event?.title}</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Confirmados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabla de reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Platos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Reserva</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation._id}>
                  <TableCell className="font-medium">{reservation.customerName}</TableCell>
                  <TableCell>{reservation.customerPhone}</TableCell>
                  <TableCell>{reservation.numberOfPlates}</TableCell>
                  <TableCell>${reservation.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>{new Date(reservation.createdAt).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {reservation.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => updateReservationStatus(reservation._id, "confirmed")}>
                              <Check className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateReservationStatus(reservation._id, "cancelled")}>
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => sendWhatsAppMessage(reservation)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Enviar WhatsApp
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredReservations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No se encontraron reservas que coincidan con la búsqueda"
                : "No hay reservas para este evento"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
