"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ImageSelector } from "@/components/image-selector"
import { Loader2, X, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    additionalImages: [] as string[],
    category: "",
    stock: "0",
    facebookUrl: "",
    postSlug: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        image: product.image || "",
        additionalImages: product.additionalImages || [],
        category: product.category || "",
        stock: product.stock?.toString() || "0",
        facebookUrl: product.facebookUrl || "",
        postSlug: product.postSlug || "",
      })
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }))
  }

  const handleAddAdditionalImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, url],
    }))
  }

  const handleRemoveAdditionalImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    // Validar que el precio sea un número válido
    const price = Number.parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Precio inválido",
        description: "Por favor, ingresa un precio válido mayor que cero.",
        variant: "destructive",
      })
      return
    }

    // Validar que el stock sea un número entero válido
    const stock = Number.parseInt(formData.stock)
    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Stock inválido",
        description: "Por favor, ingresa un valor de stock válido (0 o mayor).",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = product ? `/api/products/${product._id}` : "/api/products"
      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: price,
          stock: stock,
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
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            required
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium mb-1">
            Stock
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
            className="h-24"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Imagen Principal <span className="text-red-500">*</span>
          </label>
          <ImageSelector value={formData.image} onChange={handleImageChange} label="Imagen del Producto" />
          {formData.image && <p className="mt-1 text-xs text-gray-500">URL de imagen: {formData.image}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Imágenes Adicionales</label>
          <div className="mb-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("additional-image-selector")?.click()}
              className="w-full border-dashed border-2 py-8"
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir imagen adicional
            </Button>
            <div className="hidden">
              <ImageSelector
                value=""
                onChange={handleAddAdditionalImage}
                label="Imagen Adicional"
              />
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
                      className="object-cover"
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
