"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ImageUploaderProps {
  onImageUploaded: (imageData: any) => void
  showGalleryOptions?: boolean
}

export function ImageUploader({ onImageUploaded, showGalleryOptions = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState("")
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    const file = files[0]

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen.",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño del archivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      if (showGalleryOptions) {
        formData.append("isPublic", isPublic.toString())
        formData.append("tags", tags)
      }

      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      onImageUploaded(data.image)

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ""

      if (showGalleryOptions) {
        setTags("")
      }
    }
  }

  return (
    <div className="space-y-4">
      {showGalleryOptions && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(!!checked)} />
            <Label htmlFor="isPublic">Imagen pública (visible para todos los usuarios)</Label>
          </div>

          <div>
            <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
            <Input
              id="tags"
              placeholder="planta, flor, jardín..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={isUploading}
            className="relative"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir imagen
              </>
            )}
          </Button>
          <span className="text-xs text-gray-500">Formatos: JPG, PNG, GIF. Máx: 5MB</span>
        </div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  )
}
