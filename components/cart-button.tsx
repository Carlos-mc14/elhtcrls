"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { CartDrawer } from "./cart-drawer"

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { cart } = useCartStore()

  return (
    <>
      <Button variant="outline" size="icon" className="relative bg-transparent" onClick={() => setIsOpen(true)}>
        <ShoppingCart className="h-4 w-4" />
        {cart.totalItems > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-600">
            {cart.totalItems}
          </Badge>
        )}
      </Button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
