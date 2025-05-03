import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPostsForAdmin } from "@/lib/api/posts"
import { PostsTable } from "@/components/posts-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default async function AdminPosts() {
  const session = await getServerSession(authOptions)
  const posts = session?.user.id
    ? await getPostsForAdmin(session.user.id, session.user.role === "admin")
    : []

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestionar Publicaciones</h1>
        <Link href="/admin/posts/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Publicación
          </Button>
        </Link>
      </div>

      <PostsTable posts={posts} isAdmin={session?.user.role === "admin"} />
    </div>
  )
}
