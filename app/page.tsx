import { PostCard } from "@/components/post-card"
import { HeroSection } from "@/components/hero-section"
import { FeaturedPosts } from "@/components/featured-posts"
import { getPosts } from "@/lib/api/posts"
import type { Post } from "@/types/post"

export default async function Home() {
  try {
    const posts = (await getPosts({ limit: 6 })) as Post[]
    const featuredPosts = posts.slice(0, 3)

    return (
      <div className="w-full">
        <HeroSection />
        <FeaturedPosts posts={featuredPosts} />

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-soil-brown">Publicaciones Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts && posts.length > 0 ? (
              posts.map((post: Post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No hay publicaciones disponibles. ¡Crea la primera!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error("Error en la página Home:", error)
    return (
      <div className="w-full">
        <HeroSection />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-soil-brown">Publicaciones Recientes</h2>
          <p className="text-red-500">
            Error al cargar las publicaciones. Por favor, verifica la conexión a la base de datos.
          </p>
        </div>
      </div>
    )
  }
}
