"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, ChevronLeft, ChevronRight } from "lucide-react"

interface ProductInfoModalProps {
  product: {
    _id: string
    name: string
    description: string
    price: number
    image: string
    additionalImages?: string[]
    category: string
    stock: number
    facebookUrl?: string
    postSlug?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ProductInfoModal({ product, isOpen, onClose }: ProductInfoModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Combinar imagen principal con imágenes adicionales
  const allImages = [product.image, ...(product.additionalImages || [])]

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            <Badge className="mt-2">{product.category}</Badge>
          </DialogDescription>
        </DialogHeader>

        {/* Carousel de imágenes */}
        <div className="relative mt-4 mb-6">
          <div className="relative h-64 w-full rounded-md overflow-hidden">
            <Image
              src={allImages[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
              alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {allImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Indicadores de imágenes */}
              <div className="flex justify-center gap-1 mt-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-green-600" : "bg-gray-300"}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-green-700">S/ {product.price.toFixed(2)}</div>
            <Badge
              variant={product.stock > 0 ? "outline" : "destructive"}
              className={product.stock > 0 ? "border-leaf-medium text-leaf-dark" : ""}
            >
              {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          {product.facebookUrl && (
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <a href={product.facebookUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver en Facebook
              </a>
            </Button>
          )}

          {product.postSlug && (
            <Button variant="outline" className="w-full sm:w-auto border-leaf-light hover:bg-leaf-light/10" asChild>
              <Link href={`/posts/${product.postSlug}`}>
                <FileText className="mr-2 h-4 w-4" />
                Ver artículo relacionado
              </Link>
            </Button>
          )}

          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
