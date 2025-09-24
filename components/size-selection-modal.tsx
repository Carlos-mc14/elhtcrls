"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCartStore } from "@/lib/cart-store"
import type { Product } from "@/types/product"
import type { Tag } from "@/types/tag"

interface SizeSelectionModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function SizeSelectionModal({ product, isOpen, onClose }: SizeSelectionModalProps) {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()
  const { addItem } = useCartStore()

  const sizeTags = product.tags?.filter((tag) => tag.type === "size" && tag.priceRange) || []
  const availableSizeTags = sizeTags.filter((tag) => {
    const tagStock = product.tagStock?.find((ts) => ts.tagId === tag._id)
    return tagStock && tagStock.stock > 0
  })

  const getTagStock = (tagId: string) => {
    return product.tagStock?.find((ts) => ts.tagId === tagId)?.stock || 0
  }

  const getTagPrice = (tag: Tag) => {
    return tag.priceRange?.price || product.price
  }

  const handleAddToCart = async () => {
    if (!selectedTag) {
      toast({
        title: "Selecciona un tamaño",
        description: "Debes seleccionar un tamaño antes de agregar al carrito",
        variant: "destructive",
      })
      return
    }

    const tagStock = getTagStock(selectedTag._id)
    if (quantity > tagStock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${tagStock} disponibles de este tamaño`,
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/products/${product._id}/validate-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          selectedTags: [selectedTag._id],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      addItem({
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        price: getTagPrice(selectedTag),
        quantity,
        selectedTags: [
          {
            tagId: selectedTag._id,
            tagName: selectedTag.name,
            tagColor: selectedTag.color || "#6b7280",
          },
        ],
      })

      toast({
        title: "Producto agregado",
        description: `${product.name} (${selectedTag.name}) se agregó al carrito`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Seleccionar tamaño
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-600">Selecciona el tamaño que deseas</p>
          </div>

          {availableSizeTags.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No hay tamaños disponibles</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableSizeTags.map((tag) => {
                const stock = getTagStock(tag._id)
                const price = getTagPrice(tag)
                const isSelected = selectedTag?._id === tag._id

                return (
                  <div
                    key={tag._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge
                          style={{ backgroundColor: (tag.color || "#6b7280") + "20", color: tag.color || "#6b7280" }}
                          className="mb-1"
                        >
                          {tag.name}
                        </Badge>
                        <p className="text-sm text-gray-600">
                          {tag.priceRange && `${tag.priceRange.min}-${tag.priceRange.max}${tag.priceRange.unit}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">S/ {price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{stock} disponibles</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedTag && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(getTagStock(selectedTag._id), quantity + 1))}
                    disabled={quantity >= getTagStock(selectedTag._id)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-semibold">S/ {(getTagPrice(selectedTag) * quantity).toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!selectedTag || quantity > getTagStock(selectedTag._id)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al carrito
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
