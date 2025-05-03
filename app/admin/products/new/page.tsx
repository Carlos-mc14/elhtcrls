import { ProductForm } from "@/components/product-form"
import { getPosts } from "@/lib/api/posts"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const posts = await getPosts()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Producto</h1>
      <ProductForm posts={posts} />
    </div>
  )
}
