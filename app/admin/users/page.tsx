import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUsers } from "@/lib/api/users"
import { UsersTable } from "@/components/users-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function AdminUsers() {
  const session = await getServerSession(authOptions)

  // Only admins can access this page
  if (session?.user.role !== "admin") {
    redirect("/admin")
  }

  const users = await getUsers()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestionar Usuarios</h1>
        <Link href="/admin/users/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>
      <UsersTable users={users} />
    </div>
  )
}
