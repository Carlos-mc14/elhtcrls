"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, User, Phone, Calendar, DollarSign, Package, CheckCircle } from "lucide-react"
import type { Cart } from "@/types/cart"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function AdminCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)
  const [processingCart, setProcessingCart] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCarts()
  }, [])

  const fetchCarts = async () => {
    try {
      const response = await fetch("/api/admin/carts")
      if (response.ok) {
        const data = await response.json()
        setCarts(data.carts)
      } else {
        throw new Error("Error al cargar carritos")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los carritos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsSold = async (cartId: string) => {
    setProcessingCart(cartId)
    try {
      const response = await fetch(`/api/admin/carts/${cartId}/sell`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Carrito marcado como vendido y stock reducido",
        })
        fetchCarts() // Refresh the list
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error al marcar como vendido")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al marcar como vendido",
        variant: "destructive",
      })
    } finally {
      setProcessingCart(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4 animate-pulse" />
          <p className="text-gray-500">Cargando carritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Carritos</h1>
        <p className="text-gray-600">Administra los carritos de compras activos y marca las ventas completadas</p>
      </div>

      {carts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay carritos activos</h3>
            <p className="text-gray-600">Los carritos de los clientes aparecerán aquí cuando hagan pedidos</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {carts.map((cart) => (
            <Card key={cart.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrito #{cart.id}
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {cart.status === "active" ? "Activo" : cart.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {cart.customerName && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {cart.customerName}
                    </div>
                  )}
                  {cart.customerPhone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {cart.customerPhone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true, locale: es })}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Items del carrito */}
                  <div className="space-y-3">
                    {cart.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
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
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="h-4 w-4" />
                            {item.quantity} x S/ {item.price.toFixed(2)}
                          </div>
                          <div className="font-medium">S/ {item.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total y acciones */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">Total: S/ {cart.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => window.open(`/carrito/${cart.id}`, "_blank")}>
                        Ver Carrito
                      </Button>
                      <Button
                        onClick={() => markAsSold(cart.id)}
                        disabled={processingCart === cart.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingCart === cart.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Vendido
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
