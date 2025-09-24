"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { Minus, Plus, Trash2, MessageCircle, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart } from "lucide-react" // Declared the ShoppingCart variable

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeItem, clearCart, getCartShareId } = useCartStore()
  const { toast } = useToast()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  const handleQuantityChange = (productId: string, selectedTags: string[], newQuantity: number) => {
    updateQuantity(productId, selectedTags, newQuantity)
  }

  const handleRemoveItem = (productId: string, selectedTags: string[]) => {
    removeItem(productId, selectedTags)
  }

  const generateWhatsAppMessage = () => {
    if (!customerName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para continuar",
        variant: "destructive",
      })
      return
    }

    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/carrito/${getCartShareId()}`

    let message = `¡Hola! Soy ${customerName} y me gustaría hacer un pedido:\n\n`

    cart.items.forEach((item, index) => {
      message += `${index + 1}. ${item.productName}\n`
      message += `   Cantidad: ${item.quantity}\n`
      message += `   Precio: S/ ${item.price.toFixed(2)} c/u\n`
      if (item.selectedTags.length > 0) {
        message += `   Etiquetas: ${item.selectedTags.map((tag) => tag.tagName).join(", ")}\n`
      }
      message += `   Subtotal: S/ ${item.totalPrice.toFixed(2)}\n\n`
    })

    message += `TOTAL: S/ ${cart.totalPrice.toFixed(2)}\n\n`
    message += `Puedes ver el detalle completo del pedido aquí: ${shareUrl}\n\n`

    if (customerPhone.trim()) {
      message += `Mi teléfono: ${customerPhone}\n`
    }

    message += `¡Gracias!`

    const whatsappUrl = `https://wa.me/51999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleShareCart = async () => {
    try {
      if (cart.items.length === 0) {
        toast({
          title: "Carrito vacío",
          description: "No hay productos para compartir",
          variant: "destructive",
        })
        return
      }

      const cartId = getCartShareId()
      const response = await fetch(`/api/cart/${cartId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
            selectedTags: item.selectedTags,
            totalPrice: item.totalPrice,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar carrito")
      }

      const baseUrl = window.location.origin
      const shareUrl = `${baseUrl}/carrito/${cartId}`

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Mi Carrito - El Huerto de Carlos",
            text: `Mira mi carrito de compras con ${cart.totalItems} productos`,
            url: shareUrl,
          })
        } catch (error) {
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareUrl)
          toast({
            title: "Enlace copiado",
            description: "El enlace del carrito se ha copiado al portapapeles",
          })
        }
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Enlace copiado",
          description: "El enlace del carrito se ha copiado al portapapeles",
        })
      }
    } catch (error) {
      console.error("Error sharing cart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo compartir el carrito",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
          <SheetDescription>
            {cart.totalItems > 0
              ? `${cart.totalItems} producto${cart.totalItems > 1 ? "s" : ""} en tu carrito`
              : "Tu carrito está vacío"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tu carrito está vacío</p>
                <Button variant="outline" onClick={onClose} className="mt-4 bg-transparent">
                  Continuar comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex gap-3 p-3 border rounded-lg">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.productName}</h4>

                        {item.selectedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedTags.map((tag) => (
                              <Badge
                                key={tag.tagId}
                                variant="secondary"
                                className="text-xs"
                                style={{ backgroundColor: tag.tagColor + "20", color: tag.tagColor }}
                              >
                                {tag.tagName}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.selectedTags.map((t) => t.tagId),
                                  item.quantity - 1,
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.selectedTags.map((t) => t.tagId),
                                  item.quantity + 1,
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">S/ {item.totalPrice.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700"
                              onClick={() =>
                                handleRemoveItem(
                                  item.productId,
                                  item.selectedTags.map((t) => t.tagId),
                                )
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-green-600">S/ {cart.totalPrice.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Tu nombre *</label>
                    <Input
                      placeholder="Ingresa tu nombre"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tu teléfono (opcional)</label>
                    <Input
                      placeholder="Ingresa tu teléfono"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateWhatsAppMessage} className="flex-1 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar por WhatsApp
                  </Button>

                  <Button variant="outline" onClick={handleShareCart}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full text-red-600 hover:text-red-700 bg-transparent"
                >
                  Vaciar carrito
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
