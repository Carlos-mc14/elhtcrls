import { getProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { LocationBanner } from "@/components/location-banner"

// Definir la interfaz para el producto
interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  facebookUrl: string
  postSlug?: string
}

export default async function StorePage() {
  const products = (await getProducts()) as Product[]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-leaf-dark mb-4">Tienda de Plantas</h1>
      <p className="text-gray-600 mb-8">Encuentra todo lo que necesitas para tus plantas</p>

      <LocationBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}
