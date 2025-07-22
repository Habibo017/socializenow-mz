import UserProfile from "@/components/user-profile"
import { getUserProfile, getUserPosts } from "./actions" // Importa getUserPosts
import { notFound } from "next/navigation"
import { FeedPost } from "@/components/feed-post"
import { formatDistanceToNowStrict } from "date-fns"
import { ptBR } from "date-fns/locale"
import { verifyAuthToken } from "@/lib/auth" // Para verificar se o usuário logado curtiu

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const user = await getUserProfile(params.username)
  const currentUserToken = await verifyAuthToken() // Obtém o token do usuário logado

  if (!user) {
    notFound() // Exibe a página 404 se o usuário não for encontrado
  }

  // Adapta os dados do usuário do MongoDB para as props do UserProfile
  const profileData = {
    username: user.name, // Usar 'name' para exibição
    handle: user.username, // Usar 'username' para o handle
    bio: user.bio || "Sem biografia.", // Garante que bio não seja undefined
    followers: user.followers ?? 0, // Garante que seja um número
    following: user.following ?? 0, // Garante que seja um número
    avatarSrc: user.avatar || "/placeholder.svg?height=96&width=96", // Usar 'avatar'
    backgroundSrc: "/placeholder.svg?height=160&width=400", // Placeholder para background
  }

  // Busca os posts do usuário
  const userPosts = await getUserPosts(user._id, currentUserToken?.userId)

  const formattedPosts = userPosts.map((post) => ({
    _id: post._id,
    username: user.name,
    handle: user.username,
    avatarSrc: user.avatar || "/placeholder.svg?height=96&width=96",
    timeAgo: formatDistanceToNowStrict(new Date(post.createdAt), {
      addSuffix: true,
      locale: ptBR,
    }),
    content: post.content,
    imageUrl: post.image,
    likes: post.likes,
    commentsCount: post.commentsCount,
    likedByUser: post.likedByUser,
  }))

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <UserProfile {...profileData} />
      <div className="mt-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Posts de @{user.username}</h2>
        {formattedPosts.length > 0 ? (
          <div className="grid gap-6">
            {formattedPosts.map((post) => (
              <FeedPost key={post._id} {...post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Nenhum post ainda.</p>
        )}
      </div>
    </div>
  )
}
