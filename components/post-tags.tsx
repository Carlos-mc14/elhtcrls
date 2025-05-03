import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface PostTagsProps {
  tags: string[]
}

export function PostTags({ tags }: PostTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag: string) => (
        <Link key={tag} href={`/posts?tag=${encodeURIComponent(tag)}`}>
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
            {tag}
          </Badge>
        </Link>
      ))}
    </div>
  )
}
