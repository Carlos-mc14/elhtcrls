"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Share2, ShoppingCart, Eye, Facebook } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ProductInfoModal } from "./product-info-modal"
import { SizeSelectionModal } from "./size-selection-modal"
import { usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useCartStore } from "@/lib/cart-store"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isFullyInView, setIsFullyInView] = useState(false)
  const [isMostVisible, setIsMostVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { toast } = useToast()
  const { addItem } = useCartStore()

  const allImages = [product.image, ...(product.additionalImages || [])]

  const getTotalStock = () => {
    if (product.tagStock && product.tagStock.length > 0) {
      return product.tagStock.reduce((total, tagStock) => total + tagStock.stock, 0)
    }
    // Fallback al stock básico si no hay tagStock
    return product.stock || 0
  }

  const hasAvailableStock = () => {
    if (product.tagStock && product.tagStock.length > 0) {
      return product.tagStock.some((tagStock) => tagStock.stock > 0)
    }
    // Fallback al stock básico si no hay tagStock
    return product.stock > 0
  }

  useEffect(() => {
    if (!cardRef.current || allImages.length <= 1) return

    let lastVisibilityRatio = 0

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const visibilityRatio = entry.intersectionRatio

        setIsFullyInView(visibilityRatio >= 0.8)

        if (visibilityRatio > lastVisibilityRatio && visibilityRatio > 0.5) {
          setIsMostVisible(true)

          if (timerRef.current) clearTimeout(timerRef.current)
        } else if (visibilityRatio < lastVisibilityRatio) {
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            setIsMostVisible(false)
          }, 300)
        }

        lastVisibilityRatio = visibilityRatio
      },
      {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
      },
    )

    observer.observe(cardRef.current)

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [allImages.length])

  useEffect(() => {
    if (allImages.length <= 1) return

    let intervalId: NodeJS.Timeout | null = null

    const shouldActivateSlideshow = isHovering || (isFullyInView && isMostVisible)

    if (shouldActivateSlideshow) {
      if (!isHovering && isMostVisible) {
        setCurrentImageIndex(0)
      }

      intervalId = setInterval(() => {
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
      }, 10000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [allImages.length, isHovering, isFullyInView, isMostVisible])

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const productUrl = `${baseUrl}/tienda/${product._id}`

    const isMobile =
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Mira este producto: ${product.name}`,
          url: productUrl,
        })
      } catch (error) {
        copyToClipboard(productUrl)
      }
    } else {
      copyToClipboard(productUrl)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    const sizeTags = product.tags?.filter((tag) => tag.type === "size" && tag.priceRange) || []

    if (sizeTags.length > 0) {
      setIsSizeModalOpen(true)
      return
    }

    let selectedTags: Array<{ tagId: string; tagName: string; tagColor: string }> = []

    if (product.tagStock && product.tagStock.length > 0) {
      const availableTagStock = product.tagStock.find((ts) => ts.stock > 0)
      if (availableTagStock && availableTagStock.tag) {
        selectedTags = [
          {
            tagId: availableTagStock.tagId,
            tagName: availableTagStock.tag.name,
            tagColor: availableTagStock.tag.color || "#6b7280",
          },
        ]
      }
    }

    if (!hasAvailableStock()) {
      toast({
        title: "Sin stock",
        description: "Este producto no está disponible en este momento",
        variant: "destructive",
      })
      return
    }

    addItem({
      productId: product._id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: 1,
      selectedTags,
    })

    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModalOpen(true)
  }

  const isOutOfStock = !hasAvailableStock()
  const totalStock = getTotalStock()

  return (
    <>
      <Card
        ref={cardRef}
        className="group flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 bg-white"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Image Section */}
        <div className="relative h-48 bg-gray-50 overflow-hidden">
          {allImages.map((img, idx) => (
            <Image
              key={idx}
              src={img || "/placeholder.svg?height=200&width=400"}
              alt={`${product.name} - ${idx}`}
              fill
              className={`object-contain transition-opacity duration-500 ${
                idx === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              priority={idx === currentImageIndex}
            />
          ))}

          <Badge
            variant={totalStock > 0 ? "default" : "destructive"}
            className={`absolute top-3 right-3 text-xs ${
              totalStock > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {totalStock > 0 ? `${totalStock}` : "Agotado"}
          </Badge>

          {/* Image Navigation */}
          {allImages.length > 1 && isHovering && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-green-500 w-4" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">{product.name}</h3>
            <span className="text-xl font-bold text-green-600 whitespace-nowrap">S/ {product.price.toFixed(2)}</span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag._id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: tag.color || "#e5e7eb",
                    color: tag.color || "#6b7280",
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          {/* Main Action */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleQuickView}
              variant="outline"
              className="flex-1 border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="flex gap-2">
            {product.facebookUrl && (
              <Button
                variant="outline"
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                asChild
              >
                <a href={product.facebookUrl} target="_blank" rel="noopener noreferrer">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </a>
              </Button>
            )}

            {product.postSlug && (
              <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50 bg-transparent" asChild>
                <Link href={`/posts/${product.postSlug}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Leer artículo
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <ProductInfoModal
        product={{
          ...product,
          category: product.category ?? "",
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <SizeSelectionModal
        product={{
          ...product,
          tags: product.tags?.map((tag) => ({
            ...tag,
            color: tag.color ?? "",
          })),
        }}
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
      />
    </>
  )
}
