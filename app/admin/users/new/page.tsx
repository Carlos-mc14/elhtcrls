import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { UserForm } from "@/components/user-form"

export default async function NewUserPage() {
  const session = await getServerSession(authOptions)

  // Solo los administradores pueden acceder a esta página
  if (!session || session.user.role !== "admin") {
    redirect("/admin")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Usuario</h1>
      <UserForm />
    </div>
  )
}
