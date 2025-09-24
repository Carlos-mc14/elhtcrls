"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, MessageCircle, ArrowLeft, Minus, Plus, Trash2, Share2, Copy } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { motion, AnimatePresence } from "framer-motion"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [cartId, setCartId] = useState<string>("")
  const [shareUrl, setShareUrl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (cart.items.length > 0 && !cartId) {
      const newCartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setCartId(newCartId)
      const baseUrl = window.location.origin
      setShareUrl(`${baseUrl}/carrito/${newCartId}`)
    }
  }, [cart.items.length, cartId])

  const generateWhatsAppMessage = async () => {
    if (cart.items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No hay productos en el carrito para enviar",
        variant: "destructive",
      })
      return
    }

    if (!customerName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para continuar",
        variant: "destructive",
      })
      return
    }

    try {
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
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar carrito")
      }

      // Generar mensaje de WhatsApp
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

      toast({
        title: "¡Pedido enviado!",
        description: "Tu pedido ha sido enviado por WhatsApp",
      })
    } catch (error) {
      console.error("Error al enviar pedido:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el pedido",
        variant: "destructive",
      })
    }
  }

  const shareCart = async () => {
    try {
      if (cart.items.length === 0) {
        toast({
          title: "Carrito vacío",
          description: "No hay productos para compartir",
          variant: "destructive",
        })
        return
      }

      if (!cartId) {
        throw new Error("Error generando ID de carrito")
      }

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
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      })

      if (response.ok) {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "¡Carrito compartido!",
          description: "El enlace se ha copiado al portapapeles",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al compartir carrito")
      }
    } catch (error) {
      console.error("Error al compartir carrito:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo compartir el carrito",
        variant: "destructive",
      })
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace del carrito se ha copiado al portapapeles",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/tienda">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la tienda
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Mi Carrito de Compras
              </CardTitle>
              <p className="text-gray-600">
                {cart.items.length > 0
                  ? `${cart.totalItems} producto${cart.totalItems > 1 ? "s" : ""} en tu carrito`
                  : "Tu carrito está vacío"}
              </p>
            </CardHeader>

            <CardContent>
              {cart.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-600 mb-6">¡Agrega algunos productos para comenzar!</p>
                  <Button asChild>
                    <Link href="/tienda">Explorar productos</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <AnimatePresence>
                      {cart.items.map((item, index) => (
                        <motion.div
                          key={`${item.productId}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex gap-4 p-4 border rounded-lg bg-white"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0">
                            <Image
                              src={item.productImage || "/placeholder.svg"}
                              alt={item.productName}
                              fill
                              className="object-cover rounded"
                            />
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.productName}</h4>

                            {item.selectedTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
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

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 bg-transparent"
                                  onClick={() => updateQuantity(item.productId, item.selectedTags, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 bg-transparent"
                                  onClick={() => updateQuantity(item.productId, item.selectedTags, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-sm text-gray-600">S/ {item.price.toFixed(2)} c/u</div>

                              <div className="flex items-center gap-2">
                                <div className="text-lg font-bold text-green-600">S/ {item.totalPrice.toFixed(2)}</div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => removeFromCart(item.productId, item.selectedTags)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={shareCart}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir carrito
                      </Button>
                      <Button variant="outline" onClick={copyShareUrl}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar enlace
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vaciar carrito
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total:</div>
                      <div className="text-2xl font-bold text-green-600">S/ {cart.totalPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Hacer pedido por WhatsApp</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tu nombre *</label>
                        <Input
                          placeholder="Ingresa tu nombre"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Tu teléfono (opcional)</label>
                        <Input
                          placeholder="Ingresa tu teléfono"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={generateWhatsAppMessage}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Enviar pedido por WhatsApp
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
