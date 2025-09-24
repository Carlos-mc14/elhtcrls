"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Filter } from "lucide-react"
import { getTags } from "@/lib/api/tags"
import type { Tag } from "@/types/tag"

interface ProductTagFilterProps {
  selectedTags?: string[]
  priceRange?: { min: number; max: number }
  onTagsChange?: (tags: string[]) => void
  onPriceRangeChange?: (range: { min: number; max: number } | null) => void
}

const typeLabels = {
  category: "Categorías",
  size: "Tamaños",
  care: "Cuidado",
  location: "Ubicación",
}

export function ProductTagFilter({
  selectedTags = [],
  priceRange,
  onTagsChange,
  onPriceRangeChange,
}: ProductTagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState({
    min: priceRange?.min || 0,
    max: priceRange?.max || 1000,
  })

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        const tags = await getTags({ visible: true })
        setAvailableTags(tags)
      } catch (error) {
        console.error("Error al cargar etiquetas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]

    if (onTagsChange) {
      onTagsChange(newSelectedTags)
    } else {
      // Actualizar URL si no hay callback personalizado
      const params = new URLSearchParams(searchParams)

      if (newSelectedTags.length > 0) {
        params.set("tags", newSelectedTags.join(","))
      } else {
        params.delete("tags")
      }

      // Resetear página al cambiar filtros
      params.delete("page")

      router.push(`/tienda?${params.toString()}`)
    }
  }

  const handlePriceRangeChange = (field: "min" | "max", value: number) => {
    const newRange = { ...localPriceRange, [field]: value }
    setLocalPriceRange(newRange)

    if (onPriceRangeChange) {
      onPriceRangeChange(newRange)
    } else {
      const params = new URLSearchParams(searchParams)

      if (newRange.min > 0 || newRange.max < 1000) {
        params.set("priceMin", newRange.min.toString())
        params.set("priceMax", newRange.max.toString())
      } else {
        params.delete("priceMin")
        params.delete("priceMax")
      }

      params.delete("page")
      router.push(`/tienda?${params.toString()}`)
    }
  }

  const clearAllTags = () => {
    if (onTagsChange) {
      onTagsChange([])
    } else {
      const params = new URLSearchParams(searchParams)
      params.delete("tags")
      params.delete("page")
      router.push(`/tienda?${params.toString()}`)
    }
  }

  const clearPriceRange = () => {
    const newRange = { min: 0, max: 1000 }
    setLocalPriceRange(newRange)

    if (onPriceRangeChange) {
      onPriceRangeChange(null)
    } else {
      const params = new URLSearchParams(searchParams)
      params.delete("priceMin")
      params.delete("priceMax")
      params.delete("page")
      router.push(`/tienda?${params.toString()}`)
    }
  }

  const getTagById = (tagId: string) => {
    return availableTags.find((tag) => tag._id === tagId)
  }

  const tagsByType = availableTags.reduce(
    (acc, tag) => {
      if (!acc[tag.type]) acc[tag.type] = []
      acc[tag.type].push(tag)
      return acc
    },
    {} as Record<string, Tag[]>,
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Cargando filtros...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="md:hidden">
            {isExpanded ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className={`space-y-6 ${isExpanded ? "block" : "hidden md:block"}`}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Rango de Precio</h4>
            {(localPriceRange.min > 0 || localPriceRange.max < 1000) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPriceRange}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Limpiar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="priceMin" className="text-xs">
                Mínimo
              </Label>
              <Input
                id="priceMin"
                type="number"
                value={localPriceRange.min}
                onChange={(e) => handlePriceRangeChange("min", Number(e.target.value))}
                placeholder="0"
                min="0"
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="priceMax" className="text-xs">
                M��ximo
              </Label>
              <Input
                id="priceMax"
                type="number"
                value={localPriceRange.max}
                onChange={(e) => handlePriceRangeChange("max", Number(e.target.value))}
                placeholder="1000"
                min="0"
                className="h-8"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            S/{localPriceRange.min} - S/{localPriceRange.max}
          </div>
        </div>

        {/* Etiquetas seleccionadas */}
        {selectedTags.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Etiquetas Seleccionadas</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllTags}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Limpiar etiquetas
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagId) => {
                const tag = getTagById(tagId)
                return tag ? (
                  <Badge
                    key={tagId}
                    className="cursor-pointer"
                    style={{ backgroundColor: tag.color, color: "white" }}
                    onClick={() => handleTagToggle(tagId)}
                  >
                    {tag.name}
                    {tag.internalId && <span className="ml-1 text-xs opacity-75">({tag.internalId})</span>}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Etiquetas por tipo */}
        {Object.entries(tagsByType).map(([type, tags]) => (
          <div key={type}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{typeLabels[type as keyof typeof typeLabels]}</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag._id}
                  variant={selectedTags.includes(tag._id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{
                    backgroundColor: selectedTags.includes(tag._id) ? tag.color : "transparent",
                    borderColor: tag.color,
                    color: selectedTags.includes(tag._id) ? "white" : tag.color,
                  }}
                  onClick={() => handleTagToggle(tag._id)}
                >
                  {tag.name}
                  {tag.internalId && <span className="ml-1 text-xs opacity-75">({tag.internalId})</span>}
                  {tag.priceRange && (
                    <span className="ml-1 text-xs opacity-75">
                      {tag.priceRange.min}-{tag.priceRange.max}
                      {tag.priceRange.unit}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        {availableTags.length === 0 && (
          <div className="text-center py-4 text-gray-500">No hay etiquetas disponibles</div>
        )}
      </CardContent>
    </Card>
  )
}
