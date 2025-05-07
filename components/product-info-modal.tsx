"use client"

import { useState, useEffect, useRef } from "react"
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
  const [isHovering, setIsHovering] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [isInView, setIsInView] = useState(false)

  // Combinar imagen principal con imágenes adicionales
  const allImages = [product.image, ...(product.additionalImages || [])]

  // Configurar IntersectionObserver cuando el modal está abierto
  useEffect(() => {
    if (!isOpen || !carouselRef.current || allImages.length <= 1) return
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.7 } // Cuando el 70% del elemento está visible
    )
    
    observerRef.current.observe(carouselRef.current)
    
    return () => {
      if (observerRef.current && carouselRef.current) {
        observerRef.current.unobserve(carouselRef.current)
      }
    }
  }, [isOpen, allImages.length])
  
  // Efecto para cambiar imágenes solo cuando está en hover o view
  useEffect(() => {
    if (!isOpen || allImages.length <= 1 || (!isHovering && !isInView)) return
    
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
    }, 3000)
    
    return () => clearInterval(intervalId)
  }, [isOpen, allImages.length, isHovering, isInView])

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

        {/* Carousel de imágenes mejorado */}
        <div 
          ref={carouselRef}
          className="relative mt-4 mb-6" 
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative h-64 w-full rounded-md overflow-hidden">
            {allImages.map((img, idx) => (
              <Image
                key={idx}
                src={img || "/placeholder.svg?height=400&width=600"}
                alt={`${product.name} - Imagen ${idx + 1}`}
                fill
                className={`object-contain transform transition-all duration-700 ease-in-out ${
                  idx === currentImageIndex 
                    ? "opacity-100 scale-100" 
                    : "opacity-0 scale-95 absolute"
                }`}
                priority={idx === currentImageIndex}
              />
            ))}
          </div>

          {allImages.length > 1 && (
            <>
              <div className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-300 ${
                isHovering ? "opacity-100" : "opacity-0"
              }`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white shadow-md transform transition-transform hover:scale-110"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white shadow-md transform transition-transform hover:scale-110"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Indicadores de imágenes con animación */}
              <div className={`flex justify-center gap-1 mt-2 transition-opacity duration-300 ${
                isHovering || isInView ? "opacity-100" : "opacity-50"
              }`}>
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? "bg-green-600 w-6" 
                        : "bg-gray-300 w-2 hover:bg-gray-400"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>

              {/* Miniaturas de imágenes con hover effect */}
              <div className="flex overflow-x-auto gap-2 mt-2 pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? "border-2 border-green-600 shadow-md" 
                        : "border border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <Image 
                      src={img || "/placeholder.svg?height=100&width=100"} 
                      alt={`Miniatura ${idx + 1}`}
                      fill
                      className={`object-cover transition-transform duration-500 ${
                        isHovering && idx === currentImageIndex ? "scale-110" : "scale-100"
                      }`}
                    />
                  </button>
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

          <Button variant="ghost" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}