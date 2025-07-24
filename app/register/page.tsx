import { RegisterForm } from "@/components/register-form"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
  const user = await getAuthenticatedUser()

  if (user) {
    redirect("/feed") // Se já estiver logado, redireciona para o feed
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <RegisterForm />
    </div>
  )
}
