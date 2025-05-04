import { getPosts } from "@/lib/api/posts"
import { PostCard } from "@/components/post-card"
import { SearchBar } from "@/components/search-bar"
import { TagFilter } from "@/components/tag-filter"
import { Pagination } from "@/components/pagination"
import { Suspense } from "react"

interface PostsPageProps {
  searchParams: {
    page?: string
    q?: string
    tag?: string
  }
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  // Esperar a que searchParams se resuelva
  const resolvedParams = await searchParams

  const pageParam = resolvedParams.page
  const searchParam = resolvedParams.q
  const tagParam = resolvedParams.tag

  const page = Number(pageParam) || 1
  const search = searchParam || ""
  const tag = tagParam || ""

  const { posts, totalPages }: { posts: Array<{ _id: string; title: string; slug: string; createdAt: string; [key: string]: any }>; totalPages: number } = await getPosts({
    page,
    search,
    tag,
    limit: 9,
    withPagination: true,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-green-800 mb-8">Todas las Publicaciones</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-2/3">
          <Suspense fallback={<div>Cargando búsqueda…</div>}>
            <SearchBar defaultValue={search} />
          </Suspense>
        </div>
        <div className="w-full md:w-1/3">
          <Suspense fallback={<div>Cargando filtros…</div>}>
            <TagFilter selectedTag={tag} />
          </Suspense>
        </div>
      </div>

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => (
              <PostCard key={post._id.toString()} post={post} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-medium text-gray-600">No se encontraron publicaciones</h3>
          <p className="mt-2 text-gray-500">Intenta con otra búsqueda o etiqueta</p>
        </div>
      )}
    </div>
  )
}
