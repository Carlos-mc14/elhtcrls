"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { CreateFoodEventData } from "@/types/food-event"

export default function NewFoodEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateFoodEventData>({
    title: "",
    description: "",
    eventDate: "",
    reservationDeadline: "",
    pricePerPlate: 0,
    maxPlates: 0,
    image: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pricePerPlate" || name === "maxPlates" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar fechas
      const eventDate = new Date(formData.eventDate)
      const reservationDeadline = new Date(formData.reservationDeadline)

      if (reservationDeadline >= eventDate) {
        toast({
          title: "Error",
          description: "La fecha límite de reserva debe ser anterior al evento",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/food-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Evento creado correctamente",
        })
        router.push("/admin/food-events")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error al crear evento")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear evento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/food-events">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nuevo Evento Gastronómico</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Evento *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Sopa de la Casa Dominical"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerPlate">Precio por Plato *</Label>
                <Input
                  id="pricePerPlate"
                  name="pricePerPlate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerPlate}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe el evento, el menú y la experiencia..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Fecha y Hora del Evento *</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reservationDeadline">Fecha Límite de Reservas *</Label>
                <Input
                  id="reservationDeadline"
                  name="reservationDeadline"
                  type="datetime-local"
                  value={formData.reservationDeadline}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500">Debe ser anterior a la fecha del evento</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxPlates">Número Máximo de Platos *</Label>
                <Input
                  id="maxPlates"
                  name="maxPlates"
                  type="number"
                  min="1"
                  value={formData.maxPlates}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: 20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de Imagen (opcional)</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? "Creando..." : "Crear Evento"}
                <Save className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/admin/food-events">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
