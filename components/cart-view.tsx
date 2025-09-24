"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, ArrowLeft, Loader2, User, Phone, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import type { Cart } from "@/types/cart"

interface CartViewProps {
  cartId: string
}

export function CartView({ cartId }: CartViewProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [completingSale, setCompletingSale] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "editor"

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await fetch(`/api/cart/${cartId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.cart && data.cart.items.length > 0) {
            setCart(data.cart)
            setLoading(false)
            return
          }
        }

        // Si no se encuentra en Redis, intentar desde localStorage (solo para el cliente)
        if (!isAdmin) {
          const storedCart = localStorage.getItem("cart-storage")
          if (storedCart) {
            const parsedStorage = JSON.parse(storedCart)
            const storedCartData = parsedStorage?.state?.cart

            if (storedCartData && storedCartData.id === cartId) {
              setCart(storedCartData)
              setLoading(false)
              return
            }
          }
        }

        setCart({
          id: cartId,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setLoading(false)
      } catch (error) {
        console.error("Error loading cart:", error)
        setCart({
          id: cartId,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setLoading(false)
      }
    }

    loadCart()
  }, [cartId, isAdmin])

  const completeSale = async () => {
    if (!cart || !isAdmin) return

    setCompletingSale(true)
    try {
      const response = await fetch(`/api/admin/carts/${cartId}/sell`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "¡Venta completada!",
          description: "El carrito ha sido marcado como vendido y el stock ha sido reducido",
        })

        // Actualizar el estado del carrito
        setCart((prev) => (prev ? { ...prev, status: "sold", soldAt: new Date().toISOString() } : null))
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error al completar la venta")
      }
    } catch (error) {
      console.error("Error completing sale:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo completar la venta",
        variant: "destructive",
      })
    } finally {
      setCompletingSale(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!cart) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrito no encontrado</h2>
        <p className="text-gray-600 mb-6">El carrito que buscas no existe o ha expirado</p>
        <Button asChild>
          <Link href="/tienda">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ir a la tienda
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={isAdmin ? "/admin/carts" : "/tienda"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isAdmin ? "Volver a carritos" : "Volver a la tienda"}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isAdmin ? "Carrito del Cliente" : "Carrito Compartido"}
            {cart.status === "sold" && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Vendido
              </Badge>
            )}
          </CardTitle>
          <div className="space-y-2">
            <p className="text-gray-600">
              {cart.items.length > 0
                ? `${cart.totalItems} producto${cart.totalItems > 1 ? "s" : ""} en este carrito`
                : "Este carrito está vacío"}
            </p>
            {(cart.customerName || cart.customerPhone) && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {cart.customerName && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <strong>{cart.customerName}</strong>
                  </div>
                )}
                {cart.customerPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {cart.customerPhone}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Carrito vacío</h3>
              <p className="text-gray-600 mb-6">No hay productos en este carrito</p>
              <Button asChild>
                <Link href="/tienda">Explorar productos</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.items.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex gap-4 p-4 border rounded-lg">
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
                        <div className="text-sm text-gray-600">
                          Cantidad: <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Precio unitario: <span className="font-medium">S/ {item.price.toFixed(2)}</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">S/ {item.totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-semibold">Total:</span>
                <span className="text-2xl font-bold text-green-600">S/ {cart.totalPrice.toFixed(2)}</span>
              </div>

              {isAdmin && cart.status === "active" && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 text-blue-900">Acciones de Administrador</h3>
                  <Button
                    onClick={completeSale}
                    disabled={completingSale}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {completingSale ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Completando venta...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Completar Venta
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-blue-700 mt-2">
                    Esto marcará el carrito como vendido y reducirá el stock de los productos.
                  </p>
                </div>
              )}

              {cart.status === "sold" && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2 text-green-900">✅ Venta Completada</h3>
                  <div className="text-sm text-green-700">
                    {cart.soldAt && <p>Fecha: {new Date(cart.soldAt).toLocaleString("es-PE")}</p>}
                    {cart.soldBy && <p>Vendido por: {cart.soldBy}</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
