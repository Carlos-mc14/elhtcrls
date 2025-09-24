"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Tag, TagFormData } from "@/types/tag"

interface TagFormProps {
  initialData?: Tag
}

const typeOptions = [
  { value: "category", label: "Categoría" },
  { value: "size", label: "Tamaño" },
  { value: "care", label: "Cuidado" },
  { value: "location", label: "Ubicación" },
]

const unitOptions = [
  { value: "cm", label: "cm" },
  { value: "m", label: "m" },
  { value: "unidad", label: "unidad" },
  { value: "kg", label: "kg" },
]

export function TagForm({ initialData }: TagFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<TagFormData>({
    name: initialData?.name || "",
    internalId: initialData?.internalId || "",
    description: initialData?.description || "",
    color: initialData?.color || "#10b981",
    isVisible: initialData?.isVisible ?? true,
    type: initialData?.type || "category",
    priceRange: initialData?.priceRange || undefined,
  })

  const [hasPriceRange, setHasPriceRange] = useState(!!initialData?.priceRange)

  const generateInternalId = (type: string, name: string) => {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    return `${type}-${cleanName}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        internalId: formData.internalId || generateInternalId(formData.type, formData.name),
        priceRange: hasPriceRange ? formData.priceRange : undefined,
      }

      const url = initialData ? `/api/tags/${initialData._id}` : "/api/tags"
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar etiqueta")
      }

      toast({
        title: "Éxito",
        description: `Etiqueta ${initialData ? "actualizada" : "creada"} correctamente`,
      })

      router.push("/admin/tags")
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la etiqueta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePriceRangeChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        min: prev.priceRange?.min || 0,
        max: prev.priceRange?.max || 0,
        price: prev.priceRange?.price || 0,
        unit: prev.priceRange?.unit || "cm",
        [field]: field === "min" || field === "max" || field === "price" ? Number(value) : value,
      },
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value
                setFormData((prev) => ({
                  ...prev,
                  name: newName,
                  internalId: prev.internalId || generateInternalId(prev.type, newName),
                }))
              }}
              placeholder="Ej: Cactus, Interior, 10-20cm"
              required
            />
          </div>

          <div>
            <Label htmlFor="internalId">Identificador Interno *</Label>
            <Input
              id="internalId"
              value={formData.internalId}
              onChange={(e) => setFormData((prev) => ({ ...prev, internalId: e.target.value }))}
              placeholder="Ej: cactus-pequeno, interior-sombra"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Identificador único para diferenciar etiquetas con el mismo nombre. Se genera automáticamente.
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción opcional de la etiqueta"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as any
                  setFormData((prev) => ({
                    ...prev,
                    type: newType,
                    internalId: generateInternalId(newType, prev.name),
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isVisible"
              checked={formData.isVisible}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVisible: checked }))}
            />
            <Label htmlFor="isVisible">Visible en el sitio web</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rango de Precios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="hasPriceRange" checked={hasPriceRange} onCheckedChange={setHasPriceRange} />
            <Label htmlFor="hasPriceRange">Esta etiqueta tiene un rango de precios</Label>
          </div>

          {hasPriceRange && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="min">Mínimo</Label>
                <Input
                  id="min"
                  type="number"
                  value={formData.priceRange?.min || ""}
                  onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                  placeholder="10"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="max">Máximo</Label>
                <Input
                  id="max"
                  type="number"
                  value={formData.priceRange?.max || ""}
                  onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                  placeholder="20"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.priceRange?.price || ""}
                  onChange={(e) => handlePriceRangeChange("price", e.target.value)}
                  placeholder="25.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unidad</Label>
                <select
                  id="unit"
                  value={formData.priceRange?.unit || "cm"}
                  onChange={(e) => handlePriceRangeChange("unit", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {hasPriceRange && formData.priceRange && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Vista previa: {formData.priceRange.min}-{formData.priceRange.max}
                {formData.priceRange.unit} - S/{formData.priceRange.price}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : initialData ? "Actualizar Etiqueta" : "Crear Etiqueta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/tags")}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
