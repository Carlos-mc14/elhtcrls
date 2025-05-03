import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models/product"
import { ProductForm } from "@/components/product-form"
import { getPosts } from "@/lib/api/posts"
import { serializeDocument } from "@/lib/utils"

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !["admin", "editor"].includes(session.user.role)) {
    redirect("/auth/login?callbackUrl=/admin/products")
  }

  await connectToDatabase()
  const posts = await getPosts()

  try {
    const product = await Product.findById(params.id).lean()

    if (!product) {
      notFound()
    }

    // Convertir los IDs de MongoDB a strings
    const serializedProduct = serializeDocument(product)

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Editar Producto</h1>
        <ProductForm product={serializedProduct} posts={posts} />
      </div>
    )
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Error</h1>
        <p className="text-red-500">No se pudo cargar el producto. Por favor, inténtalo de nuevo.</p>
      </div>
    )
  }
}
