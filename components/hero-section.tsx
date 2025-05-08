"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Leaf, ArrowRight, SproutIcon as Seedling, Sun, Cloud, Droplet } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-12 md:py-24 lg:py-32 bg-soil-texture rounded-lg overflow-hidden relative">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Plantas decorativas */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`plant-${i}`}
            className="absolute opacity-80"
            initial={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              scale: Math.random() * 0.5 + 0.5,
              rotate: Math.random() * 20 - 10,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: i % 2 === 0 ? [0, 5, 0] : [0, -5, 0],
            }}
            transition={{
              y: { repeat: Number.POSITIVE_INFINITY, duration: 5 + i, ease: "easeInOut" },
              rotate: { repeat: Number.POSITIVE_INFINITY, duration: 10 + i * 2, ease: "easeInOut" },
            }}
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: `${Math.random() * 20}%`,
            }}
          >
            <Seedling className="text-leaf-medium" size={30 + i * 15} aria-hidden="true" />
          </motion.div>
        ))}

        {/* Sol */}
        <motion.div
          className="absolute top-10 right-10 text-yellow-500"
          animate={{
            rotate: 360,
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            rotate: { repeat: Number.POSITIVE_INFINITY, duration: 60, ease: "linear" },
            opacity: { repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" },
          }}
        >
          <Sun size={60} aria-hidden="true" />
        </motion.div>

        {/* Nubes */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute text-white opacity-80"
            initial={{ x: -100 }}
            animate={{ x: "calc(100vw + 100px)" }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 60 + i * 20,
              ease: "linear",
              delay: i * 10,
            }}
            style={{
              top: `${10 + i * 15}%`,
            }}
          >
            <Cloud size={40 + i * 10} aria-hidden="true" />
          </motion.div>
        ))}

        {/* Gotas de agua */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`drop-${i}`}
            className="absolute text-blue-400 opacity-70"
            initial={{
              x: 20 + i * 15 + "%",
              y: -50,
              opacity: 0,
            }}
            animate={{
              y: "calc(100vh + 50px)",
              opacity: [0, 0.7, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 5 + i * 2,
              ease: "easeIn",
              delay: i * 3,
              opacity: { duration: 2 },
            }}
          >
            <Droplet size={15 + i * 5} aria-hidden="true" />
          </motion.div>
        ))}
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-block">
              <motion.span
                className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-leaf-light/20 text-leaf-dark mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.span
                  className="mr-1 bg-leaf-medium rounded-full h-2 w-2"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  aria-hidden="true"
                ></motion.span>
                Nuevo Blog de Plantas
              </motion.span>
            </div>

            <motion.h1
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient-green"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Cultiva tus propias plantas y comparte tu experiencia
            </motion.h1>
            <motion.p
              className="max-w-[600px] text-gray-700 md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Aprende a cultivar y cuidar tus plantas de manera orgánica y sostenible.  
              También puedes leer nuestros artículos sobre jardinería, huertos y mucho más.
            </motion.p>
            <motion.div
              className="flex flex-col gap-2 min-[400px]:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                asChild
                className="bg-gradient-green text-white shadow-lg hover:shadow-leaf-medium/30 transition-all duration-300 group focus-visible-ring"
              >
                <Link href="/posts">
                  Explorar Blog
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-leaf-light hover:border-leaf-medium hover:bg-leaf-light/10 transition-all duration-300 focus-visible-ring"
              >
                <Link href="/auth/register">Crear Cuenta</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
            <Image
              src="/orquidea.jpg?height=500&width=500"
              alt="Plantas en crecimiento en un huerto"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {/* Elementos decorativos sobre la imagen */}
            <motion.div
              className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-leaf-dark" aria-hidden="true" />
                <span className="text-sm font-medium text-leaf-dark">Cultivo Orgánico</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
