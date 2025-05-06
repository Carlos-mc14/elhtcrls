"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ImageGallery } from "@/components/image-gallery"
import { ImageIcon, X } from "lucide-react"

interface ImageSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ImageSelector({ value, onChange}: ImageSelectorProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(value || "")

  useEffect(() => {
    setImageUrl(value || "")
  }, [value])

  const handleSelectImage = (imagePath: string) => {
    console.log("Imagen seleccionada en ImageSelector:", imagePath)
    onChange(imagePath)
    setImageUrl(imagePath)
    setIsGalleryOpen(false)
  }

  const handleRemoveImage = () => {
    onChange("")
    setImageUrl("")
  }

  // Función para obtener una URL de imagen válida para visualización
  const getDisplayImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg?height=200&width=400"

    // Si la URL ya es absoluta (comienza con http o https), usarla directamente
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }

    // Si es una ruta relativa, asegurarse de que comience con /
    return url.startsWith("/") ? url : `/${url}`
  }

  return (
    <div className="space-y-2 bg-white p-4 rounded-md border border-gray-300">
      <label className="block text-sm font-medium"></label>

      {imageUrl ? (
        <div className="relative">
          <div className="relative h-48 w-full rounded-md overflow-hidden">
            <Image src={getDisplayImageUrl(imageUrl) || "/placeholder.svg"} alt="" fill className="object-contain" />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="bg-white bg-opacity-70 hover:bg-opacity-100"
              onClick={() => setIsGalleryOpen(true)}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="bg-white bg-opacity-70 hover:bg-opacity-100 hover:text-red-500"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-48 flex flex-col items-center justify-center gap-2 border-dashed"
          onClick={() => setIsGalleryOpen(true)}
        >
          <ImageIcon className="h-8 w-8 text-gray-400" />
          <span>Seleccionar imagen de la galería</span>
        </Button>
      )}

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl p-0">
          <ImageGallery onSelectImage={handleSelectImage} onClose={() => setIsGalleryOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
