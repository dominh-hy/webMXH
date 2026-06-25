import { getCategories, getTags } from '@/lib/supabase/queries'
import PostEditor from '@/components/admin/PostEditor'

export default async function CreatePostPage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()])

  return (
    <div className="-m-6 lg:-m-8 h-[calc(100vh-0px)]">
      <PostEditor categories={categories} tags={tags} />
    </div>
  )
}
