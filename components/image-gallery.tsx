"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ImageUploader } from "@/components/image-uploader"
import { Search, Trash2, RefreshCw, Check, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ImageGalleryProps {
  onSelectImage: (imagePath: string) => void
  onClose: () => void
}

export function ImageGallery({ onSelectImage, onClose }: ImageGalleryProps) {
  const [images, setImages] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchImages = async (tab = selectedTab) => {
    setIsLoading(true)
    setError(null)

    try {
      const isPublic = tab === "public" ? "true" : tab === "private" ? "false" : undefined
      const url = `/api/images${isPublic ? `?isPublic=${isPublic}` : ""}`

      console.log("Fetching images from:", url)

      const response = await fetch(url)

      console.log("Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error text:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
          throw new Error(errorData.error || `Error del servidor: ${response.status}`)
        } catch (e) {
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}. Texto: ${errorText.substring(0, 100)}...`,
          )
        }
      }

      const data = await response.json()
      console.log("Imágenes cargadas:", data.images)

      if (Array.isArray(data.images)) {
        setImages(data.images)
      } else {
        console.error("Formato de respuesta inesperado:", data)
        setImages([])
        setError("Formato de respuesta inesperado")
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar imágenes")
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleTabChange = (value: string) => {
    setSelectedTab(value)
    fetchImages(value)
  }

  const handleImageUpload = (imageData: any) => {
    console.log("Imagen subida recibida:", imageData)
    setImages((prev) => [imageData, ...prev])
    toast({
      title: "Imagen subida",
      description: "La imagen se ha subido correctamente",
    })
  }

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error al eliminar imagen:", errorText)
        throw new Error("Error al eliminar imagen")
      }

      setImages((prev) => prev.filter((img) => img._id !== id))
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error al actualizar imagen:", errorText)
        throw new Error("Error al actualizar imagen")
      }

      setImages((prev) => prev.map((img) => (img._id === id ? { ...img, isPublic: !isPublic } : img)))

      toast({
        title: "Imagen actualizada",
        description: `La imagen ahora es ${!isPublic ? "pública" : "privada"}`,
      })
    } catch (error) {
      console.error("Error al actualizar imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen",
        variant: "destructive",
      })
    }
  }

  const handleSelectImage = () => {
    if (selectedImage) {
      console.log("Imagen seleccionada:", selectedImage)
      onSelectImage(selectedImage)
      onClose()
    }
  }

  const filteredImages = images.filter((image) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      image.originalName?.toLowerCase().includes(searchLower) ||
      image.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Galería de Imágenes</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-4">
        <ImageUploader onImageUploaded={handleImageUpload} showGalleryOptions={true} />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o etiquetas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => fetchImages()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="public">Públicas</TabsTrigger>
          <TabsTrigger value="private">Mis Imágenes</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image._id}
                  className={`relative group rounded-md overflow-hidden border-2 ${
                    selectedImage === image.path ? "border-green-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(image.path)}
                >
                  <div className="relative h-32 w-full">
                    <Image
                      src={image.path || "/placeholder.svg"}
                      alt={image.originalName || "Imagen"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePublic(image._id, image.isPublic)
                        }}
                      >
                        {image.isPublic ? <span title="Hacer privada">🔓</span> : <span title="Hacer pública">🔒</span>}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteImage(image._id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {image.isPublic && <Badge className="absolute top-1 left-1 bg-green-500">Pública</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No hay imágenes disponibles</p>
            </div>
          )}
        </div>
      </Tabs>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSelectImage} disabled={!selectedImage} className="bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          Seleccionar Imagen
        </Button>
      </div>
    </div>
  )
}
