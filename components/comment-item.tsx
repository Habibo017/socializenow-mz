import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNowStrict } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CommentItemProps {
  author: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
  content: string
  createdAt: string
}

export function CommentItem({ author, content, createdAt }: CommentItemProps) {
  const timeAgo = formatDistanceToNowStrict(new Date(createdAt), {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <div className="flex gap-3 p-3 border-b border-gray-100 last:border-b-0">
      <Link href={`/profile/${author.username}`}>
        <Avatar className="w-9 h-9 border border-africanGreen-300">
          <AvatarImage src={author.avatar || "/placeholder.svg"} alt={`@${author.username}`} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-1 text-sm">
          <Link href={`/profile/${author.username}`} className="font-semibold text-gray-900 hover:underline">
            {author.name}
          </Link>
          <span className="text-muted-foreground">@{author.username}</span>
          <span className="text-muted-foreground">• {timeAgo}</span>
        </div>
        <p className="text-gray-800 leading-relaxed mt-1">{content}</p>
        {/* Futuramente, botões de curtir/responder ao comentário */}
      </div>
    </div>
  )
}
