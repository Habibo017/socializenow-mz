import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-africanYellow-50 to-africanRed-50 p-4 text-center">
      <div className="relative z-10 flex flex-col items-center justify-center max-w-3xl mx-auto">
        <Image
          src="/placeholder-logo.svg"
          alt="SocializeNow Logo"
          width={150}
          height={150}
          className="mb-6 animate-bounce-slow"
        />
        <h1 className="text-5xl md:text-6xl font-extrabold text-mozambique-800 mb-4 leading-tight">
          Bem-vindo ao <span className="text-africanGreen-600">SocializeNow</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
          Sua rede social moçambicana para conectar, compartilhar e descobrir o que está acontecendo ao seu redor.
          Junte-se à nossa comunidade vibrante!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button className="w-full sm:w-auto px-8 py-3 text-lg bg-africanGreen-600 hover:bg-africanGreen-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 text-lg border-2 border-mozambique-500 text-mozambique-700 hover:bg-mozambique-100 hover:text-mozambique-800 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 bg-transparent"
            >
              Cadastrar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
