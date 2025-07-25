import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedPostProps {
  username: string
  handle: string
  avatarSrc: string
  timeAgo: string
  content: string
  imageUrl?: string
  likes: number
  comments: number
}

export function FeedPost({ username, handle, avatarSrc, timeAgo, content, imageUrl, likes, comments }: FeedPostProps) {
  return (
    <Card className="w-full rounded-xl shadow-md border-africanGreen-100">
      <CardHeader className="flex flex-row items-center gap-4 p-4 pb-0">
        <Link href={`/profile/${handle}`}>
          <Avatar className="w-12 h-12 border-2 border-africanGreen-500">
            <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={`@${handle}`} />
            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="grid gap-0.5">
          <Link href={`/profile/${handle}`} className="font-semibold text-gray-900 hover:underline">
            {username}
          </Link>
          <div className="text-sm text-muted-foreground">
            <Link href={`/profile/${handle}`} className="hover:underline">
              @{handle}
            </Link>{" "}
            • {timeAgo}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-gray-800 leading-relaxed mb-4">{content}</p>
        {imageUrl && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt="Post image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-africanRed-500">
            <Heart className="w-5 h-5" />
            <span className="text-sm">{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-600 hover:text-africanGreen-500"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{comments}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-mozambique-500">
          <Share2 className="w-5 h-5" />
          <span className="text-sm">Compartilhar</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
