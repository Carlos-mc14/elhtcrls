"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils/date-utils"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, User } from "lucide-react"
import type { Post } from "@/types/post"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  // Función para obtener una URL de imagen válida
  const getImageUrl = (url: string | undefined | null) => {
    if (!url) return "/placeholder.svg?height=200&width=400"

    // Si la URL ya es absoluta (comienza con http o https), usarla directamente
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }

    // Si es una ruta relativa, asegurarse de que comience con /
    return url.startsWith("/") ? url : `/${url}`
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300 border-leaf-light/20 bg-white">
        <Link
          href={`/posts/${post.slug}`}
          className="relative h-48 overflow-hidden group"
          aria-label={`Ver artículo: ${post.title}`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <Image
            src={getImageUrl(post.coverImage) || "/placeholder.svg"}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
            <span className="text-sm font-medium flex items-center">
              Leer más <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
            </span>
          </div>
        </Link>
        <CardContent className="p-4 flex-grow flex flex-col bg-white">
          <div className="flex flex-wrap gap-2 mb-2">
            {post.tags && post.tags.length > 0
              ? post.tags.slice(0, 2).map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-leaf-light/20 text-leaf-dark hover:bg-leaf-light/30 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))
              : null}
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2 text-soil-brown">
            <Link href={`/posts/${post.slug}`} className="hover:text-leaf-dark transition-colors">
              {post.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">{post.excerpt}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-leaf-light/10">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 border border-leaf-light/30">
                <AvatarImage src={post.author?.image || ""} alt="" />
                <AvatarFallback className="bg-gradient-green text-white text-xs">
                  {post.author?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 flex items-center">
                <User className="h-3 w-3 mr-1 text-leaf-medium" aria-hidden="true" />
                {post.author?.name || "Anónimo"}
              </span>
            </div>
            <time
              className="text-xs text-gray-600 bg-leaf-light/10 px-2 py-1 rounded-full flex items-center"
              dateTime={post.createdAt}
            >
              <Calendar className="h-3 w-3 mr-1 text-leaf-medium" aria-hidden="true" />
              {formatDate(post.createdAt, "d MMM, yyyy")}
            </time>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
