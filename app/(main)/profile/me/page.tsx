import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"

export default async function MyProfilePage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    // Se não houver usuário autenticado, redireciona para o login
    redirect("/login")
  }

  // Redireciona para o perfil do usuário logado
  redirect(`/profile/${user.username}`)
}
