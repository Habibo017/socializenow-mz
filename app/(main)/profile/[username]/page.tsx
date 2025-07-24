import { getAuthenticatedUser } from "@/lib/auth"
import { getUserProfileAndPosts } from "./actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedPost } from "@/components/feed-post"
import { notFound } from "next/navigation"

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = params
  const currentUser = await getAuthenticatedUser()
  const { user, posts } = await getUserProfileAndPosts(username)

  if (!user) {
    notFound()
  }

  const isCurrentUser = currentUser?._id === user._id

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="mb-6">
        <CardHeader className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt={`${user.username}'s avatar`} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
          <p className="text-gray-500 text-lg">@{user.username}</p>
          {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <span className="font-bold">{user.followers}</span>
              <p className="text-sm text-gray-500">Seguidores</p>
            </div>
            <div className="text-center">
              <span className="font-bold">{user.following}</span>
              <p className="text-sm text-gray-500">Seguindo</p>
            </div>
            <div className="text-center">
              <span className="font-bold">{user.postsCount}</span>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
          </div>
          {!isCurrentUser && <Button className="mt-6">Seguir</Button>}
          {isCurrentUser && (
            <Button variant="outline" className="mt-6 bg-transparent">
              Editar Perfil
            </Button>
          )}
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Posts de @{user.username}</h2>
      <div className="space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => <FeedPost key={post._id} post={post} currentUserId={currentUser?._id} />)
        ) : (
          <p className="text-center text-gray-500">Nenhum post encontrado para este usuário.</p>
        )}
      </div>
    </div>
  )
}
