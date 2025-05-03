import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getProducts } from "@/lib/api/products"
import { ProductsTable } from "@/components/products-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default async function AdminProducts() {
  const session = await getServerSession(authOptions)
  const products = await getProducts()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestionar Productos</h1>
        <Link href="/admin/products/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <ProductsTable products={products} isAdmin={session?.user.role === "admin"} />
    </div>
  )
}
