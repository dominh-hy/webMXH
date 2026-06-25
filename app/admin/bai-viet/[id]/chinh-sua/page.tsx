import { notFound } from 'next/navigation'
import { getPostById, getCategories, getTags } from '@/lib/supabase/queries'
import PostEditor from '@/components/admin/PostEditor'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, categories, tags] = await Promise.all([
    getPostById(id),
    getCategories(),
    getTags(),
  ])

  if (!post) notFound()

  return (
    <div className="-m-6 lg:-m-8 h-[calc(100vh-0px)]">
      <PostEditor post={post} categories={categories} tags={tags} />
    </div>
  )
}
