"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, ExternalLink, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ProductInfoModal } from "./product-info-modal"
import { usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  additionalImages?: string[]
  category: string
  stock: number
  facebookUrl: string
  postSlug?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isFullyInView, setIsFullyInView] = useState(false)
  const [isMostVisible, setIsMostVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { toast } = useToast()
  
  // Combinar imagen principal con imágenes adicionales
  const allImages = [product.image, ...(product.additionalImages || [])]
  
  // Efecto para detectar cuando el card está en el viewport y su visibilidad
  useEffect(() => {
    if (!cardRef.current || allImages.length <= 1) return
    
    let lastVisibilityRatio = 0;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const visibilityRatio = entry.intersectionRatio
        
        // Consideramos que está completamente en vista si al menos el 80% es visible
        setIsFullyInView(visibilityRatio >= 0.8)
        
        // Determinar si la visibilidad está aumentando o disminuyendo
        if (visibilityRatio > lastVisibilityRatio && visibilityRatio > 0.5) {
          // El elemento está entrando más en la vista
          setIsMostVisible(true)
          
          // Reiniciar el temporizador si ya existía uno
          if (timerRef.current) clearTimeout(timerRef.current)
        } else if (visibilityRatio < lastVisibilityRatio) {
          // El elemento está saliendo de la vista
          // Establecer un temporizador para evitar cambios rápidos al desplazarse
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            setIsMostVisible(false)
          }, 300)
        }
        
        lastVisibilityRatio = visibilityRatio
      },
      { 
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0] // Múltiples umbrales para un seguimiento más preciso
      }
    )
    
    observer.observe(cardRef.current)
    
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [allImages.length])
  
  // Efecto para cambiar imagen cuando está en hover o es la más visible
  useEffect(() => {
    if (allImages.length <= 1) return
    
    let intervalId: NodeJS.Timeout | null = null;
    
    // Solo activar el intervalo cuando está en hover o es la más visible en el viewport
    const shouldActivateSlideshow = isHovering || (isFullyInView && isMostVisible);
    
    if (shouldActivateSlideshow) {
      // Reiniciar a la primera imagen cuando comienza la presentación
      if (!isHovering && isMostVisible) {
        setCurrentImageIndex(0);
      }
      
      intervalId = setInterval(() => {
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
      }, 10000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [allImages.length, isHovering, isFullyInView, isMostVisible]);
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  // Función para compartir el producto
  const handleShare = async () => {
    // Crear la URL completa del producto
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const productUrl = `${baseUrl}/tienda/${product._id}`
    
    // Detectar si es un dispositivo móvil
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Si es móvil y soporta la API Share, mostrar opciones nativas
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Mira este producto: ${product.name}`,
          url: productUrl,
        })
      } catch (error) {
        // Si el usuario cancela o hay un error en móvil, copiamos al portapapeles
        copyToClipboard(productUrl)
      }
    } else {
      // En PC o dispositivos que no soportan la API Share, copiar directamente al portapapeles
      copyToClipboard(productUrl)
    }
  }
  
  // Función para copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "¡Enlace copiado!",
          description: "El enlace del producto ha sido copiado al portapapeles.",
        })
      })
      .catch(() => {
        toast({
          title: "No se pudo copiar el enlace",
          description: "Ocurrió un error al copiar el enlace.",
          variant: "destructive",
        })
      })
  }

  return (
    <>
      <Card 
        ref={cardRef}
        className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative h-48">
          {/* Renderizar todas las imágenes con transición suave */}
          {allImages.map((img, idx) => (
            <Image
              key={idx}
              src={img || "/placeholder.svg?height=200&width=400"}
              alt={`${product.name} - ${idx}`}
              fill
              className={`object-contain transform transition-all duration-700 ease-in-out ${
                idx === currentImageIndex 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-95 absolute"
              }`}
              priority={idx === currentImageIndex}
            />
          ))}
          
          <Badge
            variant={product.stock > 0 ? "outline" : "destructive"}
            className={`absolute top-2 right-2 text-xs px-2 py-1 z-10 ${product.stock > 0 ? "border-leaf-medium text-leaf-dark" : ""}`}
          >
            {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
          </Badge>
          
          {/* Mostrar controles solo si hay más de una imagen */}
          {allImages.length > 1 && (
            <>
              <div 
                className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-300 ${
                  isHovering ? "opacity-100" : "opacity-0"
                }`}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-md transform transition-transform hover:scale-110"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-md transform transition-transform hover:scale-110"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Indicadores de imágenes */}
              <div className={`absolute bottom-2 left-0 right-0 flex justify-center gap-1 transition-opacity duration-300 ${
                isHovering || (isFullyInView && isMostVisible) ? "opacity-100" : "opacity-0"
              }`}>
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? "bg-green-600 w-4" 
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <CardContent className="p-4 flex-1">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold text-lg pr-2 flex-1 line-clamp-2">{product.name}</h3>
            <div className="text-lg font-bold text-leaf-dark whitespace-nowrap flex-shrink-0">
              S/ {product.price.toFixed(2)}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col gap-2 mt-auto">
          <div className="flex gap-2 w-full">
            <Button
              variant="default"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <Info className="mr-2 h-4 w-4" />
              Ver más info
            </Button>
            
                          <Button
              variant="outline" 
              className="w-10 border-leaf-light hover:bg-leaf-light/10"
              onClick={handleShare}
              title="Compartir producto"
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Compartir</span>
            </Button>
          </div>

          {product.facebookUrl && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <a href={product.facebookUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver en Facebook
              </a>
            </Button>
          )}

          {product.postSlug && (
            <Button
              variant="outline"
              className="w-full border-leaf-light hover:bg-leaf-light/10"
              asChild
            >
              <Link href={`/posts/${product.postSlug}`}>
                <Info className="mr-2 h-4 w-4" />
                Más información
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <ProductInfoModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
