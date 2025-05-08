import { notFound } from "next/navigation"
import Image from "next/image"
import { getPostBySlug } from "@/lib/api/posts"
import { CommentSection } from "@/components/comment-section"
import { AlternatingDiary } from "@/components/alternating-diary"
import { PostTags } from "@/components/post-tags"
import { formatDate } from "@/lib/utils/date-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { Metadata } from "next"
import type { Post } from "@/types/post"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"

interface PostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // Esperar a que params se resuelva
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const post = (await getPostBySlug(slug)) as Post | null

  if (!post) {
    return {
      title: "Post no encontrado",
      description: "El post que buscas no existe",
    }
  }

  return {
    title: `${post.title} | El Huerto De Carlos`,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage || "/placeholder.svg"],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  // Esperar a que params se resuelva
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const post = (await getPostBySlug(slug)) as Post | null
  const session = await getServerSession(authOptions)

  if (!post) {
    notFound()
  }

  const isAuthor = session?.user.id === post.author?._id || session?.user.role === "admin"

  // Función para obtener una URL de imagen válida
  const getImageUrl = (url: string | undefined | null) => {
    if (!url) return "/placeholder.svg?height=600&width=1200"

    // Si la URL ya es absoluta (comienza con http o https), usarla directamente
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }

    // Si es una ruta relativa, asegurarse de que comience con /
    return url.startsWith("/") ? url : `/${url}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <span>Por {post.author?.name || "Anónimo"}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>
          <PostTags tags={post.tags || []} />
        </div>
  
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(post.coverImage) || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
  
        <div className="prose prose-green max-w-none mb-12">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {post.content || ""}
          </ReactMarkdown>
        </div>
  
        <AlternatingDiary entries={post.diaryEntries || []} postId={post._id.toString()} isAuthor={isAuthor} />
  
        <CommentSection postId={post._id.toString()} comments={post.comments || []} />
      </article>
    </div>
  )
}
