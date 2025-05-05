import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPostById } from "@/lib/api/posts"
import { PostForm } from "@/components/post-form"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = params
  const session = await getServerSession(authOptions)
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  // Check if user has permission to edit this post
  if (session?.user.role !== "admin" && post.author._id !== session?.user.id) {
    redirect("/admin/posts")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Editar Publicación</h1>
      <PostForm post={post} />
    </div>
  )
}
