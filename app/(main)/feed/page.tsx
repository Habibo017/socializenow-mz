import { FeedPost } from "@/components/feed-post"
import { CreatePostForm } from "@/components/create-post-form"
import { getFeedPosts } from "./actions"

export default async function FeedPage() {
  const posts = await getFeedPosts()

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Seu Feed</h1>

      {/* Formulário para criar novo post */}
      <CreatePostForm />

      {/* Lista de posts */}
      {posts.length > 0 ? (
        posts.map((post) => <FeedPost key={post._id} {...post} />)
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum post encontrado. Seja o primeiro a postar!</p>
        </div>
      )}
    </div>
  )
}
