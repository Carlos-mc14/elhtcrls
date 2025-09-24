"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ImageSelector } from "@/components/image-selector"
import { Loader2, X, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Tag } from "@/types/tag"

interface Post {
  _id: string
  title: string
  slug: string
}

interface ProductFormProps {
  product?: any
  posts?: Post[]
}

export function ProductForm({ product, posts = [] }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const imagePickerRef = useRef<HTMLDivElement>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagStocks, setTagStocks] = useState<Record<string, number>>({})

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    additionalImages: [] as string[],
    stock: "0",
    facebookUrl: "",
    postSlug: "",
  })

  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    price: false,
    image: false,
  })

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags?visible=true")
        if (response.ok) {
          const data = await response.json()
          setAvailableTags(data.tags || [])
        }
      } catch (error) {
        console.error("Error al cargar etiquetas:", error)
      }
    }

    fetchTags()
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        image: product.image || "",
        additionalImages: product.additionalImages || [],
        stock: product.stock?.toString() || "0",
        facebookUrl: product.facebookUrl || "",
        postSlug: product.postSlug || "",
      })

      if (product.tags) {
        const tagIds = product.tags.map((tag: any) => (typeof tag === "string" ? tag : tag._id))
        setSelectedTags(tagIds)
      }

      if (product.tagStock) {
        const stockMap: Record<string, number> = {}
        product.tagStock.forEach((ts: any) => {
          stockMap[ts.tagId] = ts.stock
        })
        setTagStocks(stockMap)
      }
    }
  }, [product])

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        const newStocks = { ...tagStocks }
        delete newStocks[tagId]
        setTagStocks(newStocks)
        return prev.filter((id) => id !== tagId)
      } else {
        setTagStocks((prev) => ({ ...prev, [tagId]: 0 }))
        return [...prev, tagId]
      }
    })
  }

  const handleTagStockChange = (tagId: string, stock: number) => {
    setTagStocks((prev) => ({ ...prev, [tagId]: Math.max(0, stock) }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }))

    if (formErrors.image) {
      setFormErrors((prev) => ({ ...prev, image: false }))
    }
  }

  const handleAddAdditionalImage = (url: string) => {
    if (url) {
      setFormData((prev) => ({
        ...prev,
        additionalImages: [...prev.additionalImages, url],
      }))

      toast({
        title: "Imagen añadida",
        description: "La imagen adicional se ha añadido correctamente.",
      })
    }
  }

  const handleRemoveAdditionalImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      price: !formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0,
      image: !formData.image,
    }

    setFormErrors(errors)
    return !Object.values(errors).some((error) => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos obligatorios correctamente.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = product ? `/api/products/${product._id}` : "/api/products"
      const method = product ? "PUT" : "POST"

      const tagStockArray = selectedTags.map((tagId) => ({
        tagId,
        stock: tagStocks[tagId] || 0,
      }))

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock || 0),
          postSlug: formData.postSlug === "none" ? "" : formData.postSlug,
          tags: selectedTags,
          tagStock: tagStockArray,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error al ${product ? "actualizar" : "crear"} el producto`)
      }

      toast({
        title: product ? "Producto actualizado" : "Producto creado",
        description: product
          ? "El producto se ha actualizado correctamente."
          : "El producto se ha creado correctamente.",
      })

      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `No se pudo ${product ? "actualizar" : "crear"} el producto. Inténtalo de nuevo.`,
        variant: "destructive",
      })
      console.error("Error al enviar formulario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tagsByType = availableTags.reduce(
    (acc, tag) => {
      if (!acc[tag.type]) acc[tag.type] = []
      acc[tag.type].push(tag)
      return acc
    },
    {} as Record<string, Tag[]>,
  )

  const typeLabels = {
    category: "Categorías",
    size: "Tamaños",
    care: "Cuidado",
    location: "Ubicación",
  }

  const openImageSelector = () => {
    const el = imagePickerRef.current
    if (el) {
      const btn = el.querySelector("button")
      btn?.click()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre del Producto <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre del producto"
            className={formErrors.name ? "border-red-500" : ""}
          />
          {formErrors.name && <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Precio (S/) <span className="text-red-500">*</span>
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            className={formErrors.price ? "border-red-500" : ""}
          />
          {formErrors.price && <p className="text-red-500 text-sm mt-1">Ingrese un precio válido mayor que cero</p>}
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium mb-1">
            Stock General
          </label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Stock base del producto (opcional si usas stock por etiquetas)</p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del producto"
            className={`h-24 ${formErrors.description ? "border-red-500" : ""}`}
          />
          {formErrors.description && <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-3">Etiquetas y Stock</label>
          <div className="space-y-4">
            {Object.entries(tagsByType).map(([type, tags]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {typeLabels[type as keyof typeof typeLabels]}
                </h4>
                <div className="space-y-3">
                  {tags.map((tag) => (
                    <div key={tag._id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Badge
                        variant={selectedTags.includes(tag._id) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-gray-100 flex-shrink-0"
                        style={{
                          backgroundColor: selectedTags.includes(tag._id) ? tag.color : "transparent",
                          borderColor: tag.color,
                          color: selectedTags.includes(tag._id) ? "white" : tag.color,
                        }}
                        onClick={() => handleTagToggle(tag._id)}
                      >
                        {tag.name}
                        {tag.priceRange && (
                          <span className="ml-1 text-xs opacity-75">
                            ({tag.priceRange.min}-{tag.priceRange.max}
                            {tag.priceRange.unit})
                          </span>
                        )}
                      </Badge>

                      {selectedTags.includes(tag._id) && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Stock:</label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={tagStocks[tag._id] || 0}
                            onChange={(e) => handleTagStockChange(tag._id, Number(e.target.value))}
                            className="w-20"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Resumen de etiquetas y stock:</p>
              <div className="space-y-2">
                {selectedTags.map((tagId) => {
                  const tag = availableTags.find((t) => t._id === tagId)
                  return tag ? (
                    <div key={tagId} className="flex items-center justify-between">
                      <Badge style={{ backgroundColor: tag.color, color: "white" }}>
                        {tag.name}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer hover:bg-black/20 rounded-full"
                          onClick={() => handleTagToggle(tagId)}
                        />
                      </Badge>
                      <span className="text-sm text-gray-600">Stock: {tagStocks[tagId] || 0} unidades</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Imagen Principal <span className="text-red-500">*</span>
          </label>
          <ImageSelector value={formData.image} onChange={handleImageChange} label="Imagen del Producto" />
          {formData.image ? (
            <div className="mt-2">
              <p className="mt-1 text-xs text-gray-500">URL de imagen: {formData.image}</p>
            </div>
          ) : formErrors.image ? (
            <p className="text-red-500 text-sm mt-1">La imagen principal es obligatoria</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Imágenes Adicionales (Opcional)</label>
          <div className="mb-2">
            <Button
              type="button"
              variant="outline"
              onClick={openImageSelector}
              className="w-full border-dashed border-2 py-8 bg-transparent"
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir imagen adicional
            </Button>
            <div className="hidden" ref={imagePickerRef}>
              <ImageSelector value="" onChange={handleAddAdditionalImage} label="Imagen Adicional" />
            </div>
          </div>

          {formData.additionalImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.additionalImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-24 w-full rounded-md overflow-hidden">
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Imagen adicional ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveAdditionalImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="facebookUrl" className="block text-sm font-medium mb-1">
            URL de Facebook (opcional)
          </label>
          <Input
            id="facebookUrl"
            name="facebookUrl"
            value={formData.facebookUrl}
            onChange={handleChange}
            placeholder="https://facebook.com/mi-tienda/producto"
          />
        </div>

        <div>
          <label htmlFor="postSlug" className="block text-sm font-medium mb-1">
            Vincular a Post del Blog
          </label>
          <Select value={formData.postSlug} onValueChange={(value) => handleSelectChange("postSlug", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar post relacionado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              {posts.map((post) => (
                <SelectItem key={post._id} value={post.slug}>
                  {post.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Vincula este producto a un post del blog para proporcionar más información
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-leaf-dark hover:bg-leaf-medium text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {product ? "Actualizando..." : "Creando..."}
            </>
          ) : product ? (
            "Actualizar producto"
          ) : (
            "Crear producto"
          )}
        </Button>
      </div>
    </form>
  )
}
