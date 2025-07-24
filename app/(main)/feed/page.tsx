import { getPosts } from "./actions"
import { CreatePostForm } from "@/components/create-post-form"
import { FeedPost } from "@/components/feed-post"
import { getAuthenticatedUser } from "@/lib/auth"

export default async function FeedPage() {
  const { posts } = await getPosts()
  const currentUser = await getAuthenticatedUser()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Seu Feed</h1>
      <CreatePostForm />
      <div className="mt-8 space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => <FeedPost key={post._id} post={post} currentUserId={currentUser?._id} />)
        ) : (
          <p className="text-center text-gray-500">Nenhum post encontrado. Seja o primeiro a postar!</p>
        )}
      </div>
    </div>
  )
}
