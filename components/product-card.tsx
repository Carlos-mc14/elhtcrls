"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ProductInfoModal } from "./product-info-modal"

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

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48">
          <Image
            src={product.image || "/placeholder.svg?height=200&width=400"}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <div className="text-lg font-bold text-leaf-dark">S/ {product.price.toFixed(2)}</div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

          <div className="flex justify-between items-center">
            <Badge
              variant={product.stock > 0 ? "outline" : "destructive"}
              className={product.stock > 0 ? "border-leaf-medium text-leaf-dark" : ""}
            >
              {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <Button
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Info className="mr-2 h-4 w-4" />
            Ver más info
          </Button>

          {product.facebookUrl && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <a href={product.facebookUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver en Facebook
              </a>
            </Button>
          )}

          {product.postSlug && (
            <Button variant="outline" className="w-full border-leaf-light hover:bg-leaf-light/10" asChild>
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
