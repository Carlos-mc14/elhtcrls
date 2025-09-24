import { Suspense } from "react"
import { CartView } from "@/components/cart-view"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface CartPageProps {
  params: Promise<{ id: string }>
}

export default async function CartPage({ params }: CartPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          }
        >
          <CartView cartId={id} />
        </Suspense>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: CartPageProps) {
  const { id } = await params

  return {
    title: `Carrito Compartido - El Huerto de Carlos`,
    description: `Ve el carrito de compras compartido`,
  }
}
