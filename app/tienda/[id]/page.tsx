import { getProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { LocationBanner } from "@/components/location-banner"
import { PaginationControl } from "@/components/pagination-control"
import { ProductTagFilter } from "@/components/product-tag-filter"
import { ProductSearchFilter } from "@/components/product-search-filter"
import { Suspense } from "react"
import type { Product } from "@/types/product"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface PageProps {
  searchParams: {
    page?: string
    search?: string
    sortBy?: string
    tags?: string
  }
}

export default async function StorePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1
  const productsPerPage = 8

  const selectedTags = resolvedSearchParams.tags ? resolvedSearchParams.tags.split(",") : []

  const allProducts = (await getProducts({
    search: resolvedSearchParams.search,
    sortBy: resolvedSearchParams.sortBy as any,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  })) as Product[]

  // Calculamos el total de páginas
  const totalPages = Math.ceil(allProducts.length / productsPerPage)

  // Obtenemos los productos para esta página
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const productsToDisplay = allProducts.slice(startIndex, endIndex)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-leaf-dark mb-4">Tienda de Plantas</h1>
      <p className="text-gray-600 mb-8">Encuentra todo lo que necesitas para tus plantas</p>

      <LocationBanner />

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {/* Sidebar de filtros */}
        <div className="lg:col-span-1 space-y-6">
          <ProductSearchFilter />
          <ProductTagFilter selectedTags={selectedTags} />
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          {/* Información de resultados */}
          <div className="mb-6">
            <p className="text-gray-600">
              {allProducts.length === 0
                ? "No se encontraron productos"
                : `Mostrando ${productsToDisplay.length} de ${allProducts.length} productos`}
            </p>
          </div>

          {/* Grid de productos */}
          {productsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {productsToDisplay.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No se encontraron productos</p>
              <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <Suspense fallback={<div className="flex justify-center py-4">Cargando...</div>}>
              <PaginationControl currentPage={currentPage} totalPages={totalPages} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}
