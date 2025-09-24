"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface ProductSearchFilterProps {
  onFiltersChange?: (filters: {
    search: string
    category: string
    sortBy: string
  }) => void
}

const categories = [
  "Plantas de Interior",
  "Plantas de Exterior",
  "Suculentas",
  "Cactus",
  "Hierbas",
  "Hortalizas",
  "Frutales",
  "Flores",
  "Bonsái",
  "Accesorios",
  "Herramientas",
  "Macetas",
  "Sustratos",
  "Fertilizantes",
]

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre A-Z" },
]

export function ProductSearchFilter({ onFiltersChange }: ProductSearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest")

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search, category, sortBy })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  // Actualizar inmediatamente para categoría y ordenamiento
  useEffect(() => {
    updateFilters({ search, category, sortBy })
  }, [category, sortBy])

  const updateFilters = (filters: { search: string; category: string; sortBy: string }) => {
    if (onFiltersChange) {
      onFiltersChange(filters)
    } else {
      const params = new URLSearchParams(searchParams)

      if (filters.search) {
        params.set("search", filters.search)
      } else {
        params.delete("search")
      }

      if (filters.category && filters.category !== "all") {
        params.set("category", filters.category)
      } else {
        params.delete("category")
      }

      if (filters.sortBy && filters.sortBy !== "newest") {
        params.set("sortBy", filters.sortBy)
      } else {
        params.delete("sortBy")
      }

      // Resetear página al cambiar filtros
      params.delete("page")

      router.push(`/tienda?${params.toString()}`)
    }
  }

  const clearSearch = () => {
    setSearch("")
  }

  const clearCategory = () => {
    setCategory("all")
  }

  const clearAllFilters = () => {
    setSearch("")
    setCategory("all")
    setSortBy("newest")
  }

  const hasActiveFilters = search || category !== "all" || sortBy !== "newest"

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtros en línea */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Categoría */}
        <div className="flex-1">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordenamiento */}
        <div className="flex-1">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearAllFilters} className="whitespace-nowrap bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
