import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPostsForAdmin } from "@/lib/api/posts"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function RecentPosts() {
  const session = await getServerSession(authOptions)
  const posts = await getPostsForAdmin(session?.user.id, session?.user.role === "admin")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicaciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {posts.slice(0, 5).map((post) => (
            <div key={post._id} className="flex items-center">
              <div className="space-y-1">
                <Link href={`/admin/posts/${post._id}/edit`} className="font-medium hover:underline">
                  {post.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(post.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
              <div className="ml-auto">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    post.isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.isCompleted ? "Completado" : "En progreso"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
