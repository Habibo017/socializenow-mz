import { FeedPost } from "@/components/feed-post"

export default function FeedPage() {
  const posts = [
    {
      username: "Maria Chissano",
      handle: "mariac",
      avatarSrc: "/placeholder.svg?height=48&width=48",
      timeAgo: "2h",
      content: "Que dia lindo em Maputo! Adoro a energia da nossa cidade. #Maputo #Moçambique",
      imageUrl: "/placeholder.svg?height=300&width=500",
      likes: 120,
      comments: 15,
    },
    {
      username: "Carlos Tembe",
      handle: "carlost",
      avatarSrc: "/placeholder.svg?height=48&width=48",
      timeAgo: "5h",
      content:
        "Acabei de experimentar um prato de Matapa incrível! A culinária moçambicana é a melhor. 😋 #ComidaMoçambicana #Matapa",
      imageUrl: "/placeholder.svg?height=300&width=500",
      likes: 85,
      comments: 8,
    },
    {
      username: "Sofia Machava",
      handle: "sofiam",
      avatarSrc: "/placeholder.svg?height=48&width=48",
      timeAgo: "1d",
      content:
        "Orgulho da nossa cultura e das nossas tradições. Vamos valorizar o que é nosso! ✨ #CulturaMoçambicana #OrgulhoAfricano",
      imageUrl: "/placeholder.svg?height=300&width=500",
      likes: 250,
      comments: 30,
    },
  ]

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Seu Feed</h1>
      {posts.map((post, index) => (
        <FeedPost key={index} {...post} />
      ))}
    </div>
  )
}
