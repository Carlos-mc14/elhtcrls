"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ImageGallery } from "@/components/image-gallery"
import { Leaf, Plus, Calendar, ImageIcon } from "lucide-react"

interface DiaryEntriesProps {
  entries: any[]
  postId: string
}

export function DiaryEntries({ entries = [], postId }: DiaryEntriesProps) {
  const { data: session } = useSession()
  const [diaryEntries, setDiaryEntries] = useState(entries || [])
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const { toast } = useToast()

  const isAuthor = session?.user.id === entries[0]?.author

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

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
        throw new Error("Error al añadir entrada de diario")
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
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir la entrada de diario. Inténtalo de nuevo.",
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

  if (diaryEntries.length === 0 && !isAuthor) {
    return null
  }

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Diario de Cultivo</h3>
        {isAuthor && !isAddingEntry && (
          <Button onClick={() => setIsAddingEntry(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Entrada
          </Button>
        )}
      </div>

      {isAddingEntry && (
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
        <div className="relative">
          {/* Línea de tiempo vertical */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-500 -ml-0.5 hidden md:block"></div>

          <div className="space-y-16 relative">
            {diaryEntries.map((entry, index) => (
              <div
                key={entry._id}
                className={`relative ${index % 2 === 0 ? "md:pr-8 md:text-right md:ml-0 md:mr-auto" : "md:pl-8 md:ml-auto md:mr-0"} md:w-[48%]`}
              >
                {/* Punto en la línea de tiempo */}
                <div
                  className="hidden md:block absolute top-6 w-4 h-4 rounded-full bg-green-500 z-10 shadow-md"
                  style={{ [index % 2 === 0 ? "right" : "left"]: "-8px" }}
                ></div>

                {/* Línea conectora para móviles */}
                <div className="md:hidden absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 ml-4"></div>
                <div className="md:hidden absolute left-4 top-6 w-4 h-4 rounded-full bg-green-500 z-10 shadow-md -ml-2"></div>

                {/* Contenido de la entrada */}
                <div
                  className={`bg-white rounded-xl p-6 shadow-md border border-gray-200 md:max-w-full ${index % 2 === 0 ? "" : ""} relative md:ml-0 ml-12`}
                >
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Leaf className="mr-1 h-4 w-4" />
                      Día {entry.dayNumber}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {format(new Date(entry.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>

                  <div className={`grid ${entry.images && entry.images.length > 0 ? "md:grid-cols-2 gap-6" : ""}`}>
                    <div
                      className={`prose prose-green max-w-none ${index % 2 === 0 && entry.images && entry.images.length > 0 ? "order-2" : "order-1"}`}
                    >
                      <p>{entry.content}</p>
                    </div>

                    {entry.images && entry.images.length > 0 && (
                      <div className={`${index % 2 === 0 ? "order-1" : "order-2"}`}>
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={entry.images[0] || "/placeholder.svg"}
                            alt={`Imagen principal`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {entry.images.length > 1 && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {entry.images.slice(1, 4).map((image: string, imgIndex: number) => (
                              <div key={imgIndex} className="relative h-16 rounded-lg overflow-hidden">
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`Imagen ${imgIndex + 2}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Línea conectora entre entradas */}
                {index < diaryEntries.length - 1 && (
                  <div className="hidden md:block absolute w-16 h-16">
                    <svg
                      className="absolute text-green-500"
                      style={{
                        [index % 2 === 0 ? "right" : "left"]: "-40px",
                        top: "60px",
                        transform: index % 2 === 0 ? "scaleX(-1)" : "",
                      }}
                      width="80"
                      height="60"
                      viewBox="0 0 80 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M0 30C30 30 20 0 80 0" stroke="currentColor" strokeWidth="2" fill="transparent" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
          <Leaf className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>No hay entradas de diario todavía.</p>
          {isAuthor && (
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
