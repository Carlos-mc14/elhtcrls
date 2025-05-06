import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getProductById, getProductsByCategory } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Facebook, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import type { Product } from "@/types/product"

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.id)

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscas no existe",
    }
  }

  return {
    title: `${product.name} | El Huerto De Carlos Tienda`,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  // Obtener productos relacionados
  const relatedProducts = await getProductsByCategory(product.category)
  const filteredRelatedProducts = relatedProducts.filter((p: Product) => p._id !== product._id).slice(0, 4)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/tienda" className="flex items-center text-green-600 hover:text-green-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a la tienda
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg?height=400&width=600"}
            alt={product.name}
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            {product.category}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-bold text-green-700">S/ {product.price.toFixed(2)}</p>

          <div className="border-t border-b py-4 my-4">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Disponibilidad:</span>
            {product.stock > 0 ? (
              <span className="text-green-600">{product.stock} en stock</span>
            ) : (
              <span className="text-red-600">Agotado</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button className="bg-green-600 hover:bg-green-700 flex-1" disabled={product.stock <= 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Añadir al carrito
            </Button>

            {product.facebookUrl && (
              <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 flex-1" asChild>
                <a href={product.facebookUrl} target="_blank" rel="noopener noreferrer">
                  <Facebook className="mr-2 h-4 w-4" />
                  Ver en Facebook
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {filteredRelatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRelatedProducts.map((relatedProduct: Product) => (
              <Card key={relatedProduct._id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={relatedProduct.image || "/placeholder.svg?height=200&width=400"}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{relatedProduct.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{relatedProduct.description}</p>
                  <div className="text-lg font-bold text-green-700">S/ {relatedProduct.price.toFixed(2)}</div>
                  <Button className="w-full mt-3 bg-green-600 hover:bg-green-700" asChild>
                    <Link href={`/tienda/${relatedProduct._id}`}>Ver detalles</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
