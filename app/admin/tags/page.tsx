"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import type { Tag } from "@/types/tag"

const typeLabels = {
  category: "Categoría",
  size: "Tamaño",
  care: "Cuidado",
  location: "Ubicación",
}

const typeColors = {
  category: "bg-blue-100 text-blue-800",
  size: "bg-green-100 text-green-800",
  care: "bg-yellow-100 text-yellow-800",
  location: "bg-purple-100 text-purple-800",
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (typeFilter) params.append("type", typeFilter)

      const response = await fetch(`/api/tags?${params}`)
      if (!response.ok) throw new Error("Error al cargar etiquetas")

      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las etiquetas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la etiqueta "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar etiqueta")
      }

      toast({
        title: "Éxito",
        description: "Etiqueta eliminada correctamente",
      })

      fetchTags()
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la etiqueta",
        variant: "destructive",
      })
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const tag = tags.find((t) => t._id === id)
      if (!tag) return

      const response = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...tag,
          isVisible: !currentVisibility,
        }),
      })

      if (!response.ok) throw new Error("Error al actualizar etiqueta")

      toast({
        title: "Éxito",
        description: `Etiqueta ${!currentVisibility ? "mostrada" : "ocultada"} correctamente`,
      })

      fetchTags()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la etiqueta",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTags()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, typeFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Etiquetas</h1>
        </div>
        <div className="text-center py-8">Cargando etiquetas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Etiquetas</h1>
        <Link href="/admin/tags/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Etiqueta
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar etiquetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos los tipos</option>
              <option value="category">Categoría</option>
              <option value="size">Tamaño</option>
              <option value="care">Cuidado</option>
              <option value="location">Ubicación</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <Card key={tag._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{tag.name}</h3>
                    {!tag.isVisible && <EyeOff className="h-4 w-4 text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">/{tag.slug}</p>
                  {tag.description && <p className="text-sm text-gray-500 mb-3">{tag.description}</p>}
                </div>
                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: tag.color }} />
              </div>

              <div className="flex items-center justify-between mb-3">
                <Badge className={typeColors[tag.type]}>{typeLabels[tag.type]}</Badge>
                {tag.priceRange && (
                  <span className="text-sm font-medium text-green-600">
                    {tag.priceRange.min}-{tag.priceRange.max}
                    {tag.priceRange.unit}: S/{tag.priceRange.price}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleVisibility(tag._id, tag.isVisible)}>
                  {tag.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Link href={`/admin/tags/${tag._id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(tag._id, tag.name)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No se encontraron etiquetas</p>
            <Link href="/admin/tags/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera etiqueta
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
