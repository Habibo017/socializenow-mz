import UserProfile from "@/components/user-profile"
import { getUserProfile } from "./actions"
import { notFound } from "next/navigation"

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const user = await getUserProfile(params.username)

  if (!user) {
    notFound() // Exibe a página 404 se o usuário não for encontrado
  }

  // Adapta os dados do usuário do MongoDB para as props do UserProfile
  const profileData = {
    username: user.username,
    handle: user.handle,
    bio: user.bio || "Sem biografia.", // Garante que bio não seja undefined
    followers: user.followers ?? 0, // Garante que seja um número
    following: user.following ?? 0, // Garante que seja um número
    avatarSrc: user.avatarSrc || "/placeholder.svg?height=96&width=96",
    backgroundSrc: user.backgroundSrc || "/placeholder.svg?height=160&width=400",
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <UserProfile {...profileData} />
      {/* Aqui você pode adicionar uma seção para os posts do usuário */}
      <div className="mt-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Posts de @{user.handle}</h2>
        <p className="text-gray-600">Nenhum post ainda. (Em breve, os posts aparecerão aqui!)</p>
      </div>
    </div>
  )
}
