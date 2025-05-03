import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentComments() {
  // Datos de ejemplo - en una implementación real, estos vendrían de la base de datos
  const comments = [
    {
      id: "1",
      content: "¡Excelente artículo! Me ha ayudado mucho con mi cultivo de tomates.",
      author: {
        name: "María García",
        image: "",
      },
      post: {
        title: "Guía completa para cultivar tomates",
      },
      createdAt: "2023-04-15T10:30:00Z",
    },
    {
      id: "2",
      content: "¿Podrías hacer un artículo sobre cómo combatir las plagas en plantas de interior?",
      author: {
        name: "Juan Pérez",
        image: "",
      },
      post: {
        title: "Cuidados básicos para plantas de interior",
      },
      createdAt: "2023-04-14T15:45:00Z",
    },
    {
      id: "3",
      content: "He seguido tus consejos y mis suculentas están creciendo muy bien. ¡Gracias!",
      author: {
        name: "Ana Martínez",
        image: "",
      },
      post: {
        title: "Todo sobre suculentas",
      },
      createdAt: "2023-04-13T09:15:00Z",
    },
    {
      id: "4",
      content: "¿Qué opinas sobre el uso de fertilizantes orgánicos vs. químicos?",
      author: {
        name: "Carlos Rodríguez",
        image: "",
      },
      post: {
        title: "Fertilizantes para huertos urbanos",
      },
      createdAt: "2023-04-12T18:20:00Z",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentarios Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.image || "/placeholder.svg"} alt={comment.author.name} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground">
                    en <span className="italic">{comment.post.title}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
