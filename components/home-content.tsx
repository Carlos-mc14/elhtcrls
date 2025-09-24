"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Leaf, 
  ShoppingBag, 
  Heart, 
  Truck,
  Award,
  Users,
  ArrowRight,
  Loader2
} from "lucide-react"

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

interface Post {
  _id: string
  title: string
  excerpt?: string
  image?: string
  readTime?: string
  likes?: number
  slug: string
  createdAt: string
}

interface HomeContentProps {
  products: Product[]
  posts: Post[]
  totalProducts: number
}

// Categorías para mostrar
const categories = [
  { name: "Plantas de Interior", icon: "🌿", slug: "interior" },
  { name: "Plantas de Exterior", icon: "🌱", slug: "exterior" },
  { name: "Plantas con Flores", icon: "🌸", slug: "flores" },
  { name: "Plantas Tropicales", icon: "🌴", slug: "tropical" },
  { name: "Plantas Colgantes", icon: "🍃", slug: "colgante" }
]

const productFilters = [
  { name: "Últimas Llegadas", value: "newest", active: true },
  { name: "Más Vendidas", value: "popular", active: false },
  { name: "Ofertas Especiales", value: "sale", active: false }
]

export function HomeContent({ products: initialProducts, posts, totalProducts }: HomeContentProps) {
  const [activeFilter, setActiveFilter] = useState("newest")
  const [displayProducts, setDisplayProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)

  // Función para obtener productos filtrados
  const fetchFilteredProducts = async (filter: string) => {
    setLoading(true)
    try {
      let sortBy = 'newest'
      let limit = 8

      switch (filter) {
        case 'newest':
          sortBy = 'newest'
          break
        case 'popular':
          sortBy = 'newest' // Por ahora usamos newest, podrías agregar un campo popularity
          break
        case 'sale':
          sortBy = 'newest'
          break
      }

      const response = await fetch(`/api/products?sortBy=${sortBy}&limit=${limit}`)
      const data = await response.json()
      
      if (data.products) {
        // Si es ofertas especiales, simular descuentos
        if (filter === 'sale') {
          const saleProducts = data.products.map((product: Product) => ({
            ...product,
            originalPrice: product.price,
            price: product.price * 0.7 // 30% descuento
          }))
          setDisplayProducts(saleProducts)
        } else {
          setDisplayProducts(data.products)
        }
      }
    } catch (error) {
      console.error('Error al obtener productos filtrados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambio de filtro
  const handleFilterChange = (filterValue: string) => {
    setActiveFilter(filterValue)
    fetchFilteredProducts(filterValue)
  }

  return (
    <div>
      {/* Categorías de Compra */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprar por Categorías</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas para tu hogar y jardín
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-lg">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-sm">
                    {category.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ofertas Diarias */}
      <section className="py-16 bg-green-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Ofertas Diarias</h2>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-green-900"
            >
              Ver Todo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {initialProducts.slice(0, 4).map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white text-gray-900 hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                  <div className="relative">
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white z-10">
                      Sale!
                    </Badge>
                    <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Leaf className="h-16 w-16 text-green-500 opacity-50" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-green-600">
                        ${(product.price * 0.7).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                      Agregar al Carrito
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, number: "1,200+", label: "Clientes Felices" },
              { icon: Leaf, number: `${totalProducts}+`, label: "Plantas Disponibles" },
              { icon: Award, number: "98%", label: "Satisfacción" },
              { icon: Truck, number: "24h", label: "Envío Rápido" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Productos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra selección de plantas cuidadosamente elegidas para tu hogar y jardín
            </p>
          </div>

          {/* Filtros de productos */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {productFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => handleFilterChange(filter.value)}
                disabled={loading}
              >
                {loading && activeFilter === filter.value && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {filter.name}
              </Button>
            ))}
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <Leaf className="h-16 w-16 text-green-500 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 cursor-pointer" />
                    </div>
                    {activeFilter === 'sale' && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white z-10">
                        30% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                      {(product as any).originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${(product as any).originalPrice.toFixed(2)}
                        </span>
                      )}
                      {product.stock < 10 && (
                        <Badge variant="destructive" className="text-xs">
                          ¡Últimas {product.stock}!
                        </Badge>
                      )}
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              Ver Todos los Productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {posts && posts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Últimas del Blog</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Mantente al día con consejos, guías y noticias sobre el mundo de las plantas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post._id}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PostCard post={post} />
                </motion.article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Ver Todos los Artículos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Leaf className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">
              ¡Mantente conectado con la naturaleza!
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Suscríbete a nuestro newsletter y recibe consejos semanales sobre jardinería y ofertas exclusivas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email aquí..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3">
                Suscribirse
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}