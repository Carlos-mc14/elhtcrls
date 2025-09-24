"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Calendar, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import type { FoodEvent } from "@/types/food-event"

export default function FoodEventsAdminPage() {
  const [events, setEvents] = useState<FoodEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<FoodEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEvents(filtered)
  }, [events, searchTerm])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/food-events?includeInactive=true")
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Error al cargar eventos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      return
    }

    try {
      const response = await fetch(`/api/food-events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Evento eliminado correctamente",
        })
        fetchEvents()
      } else {
        throw new Error("Error al eliminar evento")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Error al eliminar evento",
        variant: "destructive",
      })
    }
  }

  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/food-events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Evento ${!currentStatus ? "activado" : "desactivado"} correctamente`,
        })
        fetchEvents()
      } else {
        throw new Error("Error al actualizar estado")
      }
    } catch (error) {
      console.error("Error updating event status:", error)
      toast({
        title: "Error",
        description: "Error al actualizar estado del evento",
        variant: "destructive",
      })
    }
  }

  const getEventStatus = (event: FoodEvent) => {
    const now = new Date()
    const eventDate = new Date(event.eventDate)
    const reservationDeadline = new Date(event.reservationDeadline)

    if (!event.isActive) return { label: "Inactivo", color: "bg-gray-500" }
    if (now > eventDate) return { label: "Finalizado", color: "bg-gray-500" }
    if (now > reservationDeadline) return { label: "Reservas Cerradas", color: "bg-red-500" }
    if (event.availablePlates === 0) return { label: "Agotado", color: "bg-orange-500" }
    return { label: "Activo", color: "bg-green-500" }
  }

  const stats = {
    total: events.length,
    active: events.filter((e) => e.isActive).length,
    upcoming: events.filter((e) => new Date(e.eventDate) > new Date()).length,
    totalRevenue: events.reduce((sum, e) => sum + (e.maxPlates - e.availablePlates) * e.pricePerPlate, 0),
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Eventos Gastronómicos</h1>
        </div>
        <div className="text-center py-8">Cargando eventos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Eventos Gastronómicos</h1>
        <Link href="/admin/food-events/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
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
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabla de eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Fecha del Evento</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Disponibilidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const status = getEventStatus(event)
                const eventDate = new Date(event.eventDate)

                return (
                  <TableRow key={event._id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {eventDate.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>${event.pricePerPlate.toLocaleString()}</TableCell>
                    <TableCell>
                      {event.availablePlates}/{event.maxPlates}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/eventos/${event._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Evento
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/food-events/${event._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/food-events/${event._id}/reservations`}>
                              <Users className="mr-2 h-4 w-4" />
                              Ver Reservas
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleEventStatus(event._id, event.isActive)}>
                            {event.isActive ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(event._id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No se encontraron eventos que coincidan con la búsqueda" : "No hay eventos creados"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
