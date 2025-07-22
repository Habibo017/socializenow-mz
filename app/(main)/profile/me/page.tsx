import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth" // Importa a função para obter o usuário atual

export default async function MyProfilePage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    // Se não houver usuário logado, redireciona para a página de login
    redirect("/login")
  }

  // Redireciona para o perfil do usuário logado usando o username (handle)
  redirect(`/profile/${currentUser.username}`)
}
