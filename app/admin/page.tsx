import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentPosts } from "@/components/recent-posts"
import { RecentComments } from "@/components/recent-comments"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      <p className="mb-6 text-gray-600">Bienvenido, {session?.user.name}</p>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <RecentPosts />
        <RecentComments />
      </div>
    </div>
  )
}
