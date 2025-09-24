import { HeroSection } from "@/components/hero-section"
import { getProducts } from "@/lib/api/products"
import { getPosts } from "@/lib/api/posts"
import type { Post } from "@/types/post"
import { HomeContent } from "@/components/home-content"
import { FoodEventsSection } from "@/components/food-events-section"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Definir la interfaz para el producto
interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  additionalImages?: string[]
  stock: number
  facebookUrl: string
  postSlug?: string
  createdAt: string
}

// Categorías para mostrar
const categories = [
  { name: "Plantas de Interior", icon: "🌿", slug: "interior" },
  { name: "Plantas de Exterior", icon: "🌱", slug: "exterior" },
  { name: "Plantas con Flores", icon: "🌸", slug: "flores" },
  { name: "Plantas Tropicales", icon: "🌴", slug: "tropical" },
  { name: "Plantas Colgantes", icon: "🍃", slug: "colgante" },
]

export default async function Home() {
  try {
    // Obtener productos más recientes y posts
    const allProducts = (await getProducts({ sortBy: "newest" })) as Product[]
    const posts = (await getPosts({ limit: 6 })) as Post[]

    // Productos destacados (primeros 8 más recientes)
    const featuredProducts = allProducts.slice(0, 8)
    const featuredPosts = posts.slice(0, 3)

    return (
      <div className="w-full">
        <HeroSection />
        <FoodEventsSection />
        <HomeContent products={featuredProducts} posts={featuredPosts} totalProducts={allProducts.length} />
      </div>
    )
  } catch (error) {
    console.error("Error en la página Home:", error)
    return (
      <div className="w-full">
        <HeroSection />
        <FoodEventsSection />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Error de Carga</h2>
          <p className="text-red-500">
            Error al cargar el contenido. Por favor, verifica la conexión a la base de datos.
          </p>
        </div>
      </div>
    )
  }
}
