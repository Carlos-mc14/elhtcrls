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

  // Función para probar la conexión con Vercel Blob
  const testBlobConnection = async () => {
    try {
      const response = await fetch("/api/blob-test")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Conexión exitosa",
          description: `Conexión con Vercel Blob establecida. Blobs encontrados: ${data.blobCount}`,
        })
      } else {
        toast({
          title: "Error de conexión",
          description: data.error || "No se pudo conectar con Vercel Blob",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al probar la conexión con Vercel Blob",
        variant: "destructive",
      })
    }
  }

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
      // Primero, probar la conexión con Vercel Blob
      const testResponse = await fetch("/api/blob-test")
      const testData = await testResponse.json()

      if (!testData.success) {
        throw new Error(`Error de conexión con Vercel Blob: ${testData.error}`)
      }

      // Si la conexión es exitosa, proceder con la carga
      const formData = new FormData()
      formData.append("file", file)

      if (showGalleryOptions) {
        formData.append("isPublic", isPublic.toString())
        formData.append("tags", tags)
      }

      console.log("Enviando solicitud para subir imagen...")

      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Texto de error completo:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}. Texto: ${errorText.substring(0, 100)}...`,
          )
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const data = await response.json()
      console.log("Datos de respuesta:", data)

      // Asegurarse de que tenemos los datos correctos antes de llamar al callback
      if (data.success && data.image) {
        onImageUploaded(data.image)

        toast({
          title: "Imagen subida",
          description: "La imagen se ha subido correctamente.",
        })
      } else {
        throw new Error("Respuesta inesperada del servidor")
      }
    } catch (error) {
      console.error("Error detallado al subir imagen:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo subir la imagen. Inténtalo de nuevo.",
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
          <Button type="button" variant="outline" onClick={testBlobConnection} className="text-xs">
            Probar conexión
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
