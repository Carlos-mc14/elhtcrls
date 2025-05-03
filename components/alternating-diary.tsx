"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ImageGallery } from "@/components/image-gallery"
import { Leaf, Plus, Calendar, ImageIcon } from "lucide-react"
import { formatDate } from "@/lib/utils/date-utils"

interface DiaryEntry {
  _id: string
  content: string
  images?: string[]
  date: string
  dayNumber: number
}

interface AlternatingDiaryProps {
  entries: DiaryEntry[]
  postId: string
  isAuthor?: boolean
}

export function AlternatingDiary({ entries = [], postId, isAuthor = false }: AlternatingDiaryProps) {
  const { data: session } = useSession()
  const [diaryEntries, setDiaryEntries] = useState(entries)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const { toast } = useToast()

  // Verificar si el usuario es administrador o editor
  const isAdminOrEditor = session?.user.role === "admin" || session?.user.role === "editor"
  // Solo permitir agregar entradas si es autor Y es admin/editor
  const canAddEntries = isAuthor && isAdminOrEditor

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || !canAddEntries) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/diary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, images }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al añadir entrada de diario")
      }

      const data = await response.json()
      setDiaryEntries([...diaryEntries, data.diaryEntry])
      setContent("")
      setImages([])
      setIsAddingEntry(false)

      toast({
        title: "Entrada añadida",
        description: "Tu entrada de diario ha sido añadida correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo añadir la entrada de diario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = (imagePath: string) => {
    setImages([...images, imagePath])
    setIsGalleryOpen(false)
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  if (diaryEntries.length === 0 && !canAddEntries) {
    return null
  }

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Diario de Cultivo</h3>
        {canAddEntries && !isAddingEntry && (
          <Button onClick={() => setIsAddingEntry(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Entrada
          </Button>
        )}
      </div>

      {isAddingEntry && canAddEntries && (
        <form onSubmit={handleAddEntry} className="mb-8 border p-4 rounded-lg">
          <h4 className="font-medium mb-2">Nueva entrada de diario</h4>
          <Textarea
            placeholder="Describe los cambios, cuidados o crecimiento de tu planta..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-4 min-h-[150px]"
          />

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Button type="button" variant="outline" onClick={() => setIsGalleryOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Seleccionar imágenes
              </Button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative h-24 rounded overflow-hidden group">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-red-500"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <span className="sr-only">Eliminar</span>✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingEntry(false)
                setContent("")
                setImages([])
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Guardar Entrada
            </Button>
          </div>
        </form>
      )}

      {diaryEntries.length > 0 ? (
        <div className="space-y-16">
          {diaryEntries.map((entry, index) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Línea conectora */}
              {index < diaryEntries.length - 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-0.5 h-16 bg-green-500" />
              )}

              {/* Título de la entrada */}
              {index > 0 && (
                <div className="flex items-center justify-center mb-6">
                  <div className="h-0.5 bg-green-500 flex-grow" />
                  <div className="px-4 py-1 bg-green-500 text-white rounded-full mx-4 text-sm font-medium">
                    DÍA {entry.dayNumber}
                  </div>
                  <div className="h-0.5 bg-green-500 flex-grow" />
                </div>
              )}

              {/* Entrada de diario alternada */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className={`grid md:grid-cols-2 ${index % 2 === 0 ? "" : "md:grid-flow-dense"}`}>
                  <div className={`p-6 flex flex-col justify-center ${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}>
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                    </div>
                    <p className="text-gray-700">{entry.content}</p>
                  </div>

                  <div className={`relative h-64 md:h-auto ${index % 2 === 0 ? "md:order-1" : "md:order-2"}`}>
                    {entry.images && entry.images.length > 0 ? (
                      <Image
                        src={entry.images[0] || "/placeholder.svg"}
                        alt={`Imagen del día ${entry.dayNumber}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Leaf className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
          <Leaf className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>No hay entradas de diario todavía.</p>
          {canAddEntries && (
            <p className="mt-2">Añade tu primera entrada para comenzar a documentar el crecimiento de tu planta.</p>
          )}
        </div>
      )}

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl p-0">
          <ImageGallery onSelectImage={handleImageSelect} onClose={() => setIsGalleryOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
