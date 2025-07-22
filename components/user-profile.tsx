import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, UserPlus } from "lucide-react"

interface UserProfileProps {
  username: string
  handle: string
  bio: string
  followers?: number
  following?: number
  avatarSrc: string
  backgroundSrc?: string
}

export default function UserProfile({
  username,
  handle,
  bio,
  followers,
  following,
  avatarSrc,
  backgroundSrc,
}: UserProfileProps) {
  return (
    <Card className="w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg">
      <div className="relative h-40 bg-gradient-to-r from-orange-500 to-red-500">
        {/* Placeholder for a background image reflecting African identity */}
        <Image
          src={backgroundSrc || "/placeholder.svg?height=160&width=400&query=african pattern"}
          alt="Background pattern"
          layout="fill"
          objectFit="cover"
          className="opacity-70"
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Avatar className="w-24 h-24 border-4 border-white shadow-md">
            <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="@user" />
            <AvatarFallback className="text-xl font-semibold bg-gray-200 text-gray-700">SN</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <CardContent className="pt-16 pb-6 px-6 text-center">
        <CardTitle className="text-2xl font-bold mb-1">{username}</CardTitle>
        <CardDescription className="text-muted-foreground mb-4">@{handle}</CardDescription>
        <p className="text-sm text-gray-700 mb-6">{bio}</p>
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg">{(followers ?? 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Seguidores</div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-center">
            <div className="font-bold text-lg">{(following ?? 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Seguindo</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button className="flex items-center gap-2 px-6 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white">
            <UserPlus className="w-4 h-4" />
            Seguir
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-6 py-2 rounded-full border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
          >
            <MessageCircle className="w-4 h-4" />
            Mensagem
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
