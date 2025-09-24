"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Leaf, 
  Star, 
  ShoppingBag, 
  Heart, 
  TrendingUp,
  ArrowRight
} from "lucide-react"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Principal */}
      <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido Izquierdo */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-green-100 text-green-800 mb-4">
                ¡Ofertas de Temporada!
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                <span className="text-green-600">Black Friday</span><br />
                Sale <span className="text-red-500">50%</span><br />
                OFF
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Transforma tu hogar en un oasis verde. Descubre nuestra colección 
                de plantas premium con descuentos increíbles.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Comprar Ahora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  Ver Catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Review Score */}
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">3.2K</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-semibold">Reseñas</div>
                  <div>Positivas</div>
                </div>
              </div>
            </motion.div>

            {/* Imagen Hero */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-3xl p-8 aspect-square max-w-lg mx-auto">
                {/* Placeholder para imagen principal */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="h-32 w-32 text-green-500 opacity-30" />
                </div>
                
                {/* Badge de promo flotante */}
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transform rotate-12">
                  ¡50% OFF!
                </div>
                
                {/* Mini cards flotantes */}
                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <div className="text-sm">
                      <div className="font-bold text-gray-900">+1.2K</div>
                      <div className="text-gray-500">Favoritos</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div className="text-sm">
                      <div className="font-bold text-gray-900">98%</div>
                      <div className="text-gray-500">Éxito</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}