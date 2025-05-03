"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils/date-utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ArrowRight, Leaf, Star } from "lucide-react"
import type { Post } from "@/types/post"

interface FeaturedPostsProps {
  posts: Post[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-16 bg-garden-pattern">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center p-1 px-3 rounded-full bg-leaf-light/20 text-leaf-dark text-sm mb-2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Star className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Destacados
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-soil-brown">Publicaciones Destacadas</h2>
          <p className="max-w-[900px] text-gray-600 md:text-xl">
            Descubre nuestras publicaciones más populares sobre cultivo y cuidado de plantas.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {posts && posts.length > 0 ? (
            posts.map((post: Post) => (
              <motion.div key={post._id} variants={item}>
                <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 border-leaf-light/20">
                  <div className="relative">
                    <div className="relative h-48">
                      <Image
                        src={post.coverImage || "/placeholder.svg?height=200&width=400"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="absolute top-2 right-2 bg-leaf-medium text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Leaf className="h-3 w-3 mr-1" aria-hidden="true" />
                      Destacado
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags &&
                          post.tags.length > 0 &&
                          post.tags.slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-leaf-light/20 text-leaf-dark hover:bg-leaf-light/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                      <h3 className="text-lg font-bold text-soil-brown">
                        <Link href={`/posts/${post.slug}`} className="hover:text-leaf-dark transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">{formatDate(post.createdAt, "d 'de' MMMM, yyyy")}</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>

                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center text-leaf-dark hover:text-leaf-medium mt-2 text-sm font-medium"
                      >
                        Leer artículo
                        <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No hay publicaciones destacadas disponibles.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
