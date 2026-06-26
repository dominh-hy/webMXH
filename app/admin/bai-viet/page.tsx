import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import AdminPostsList from '@/components/admin/AdminPostsList'

export default async function AdminPostsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id,title,slug,platform,status,views,created_at,category:categories(name)')
    .order('created_at', { ascending: false })

  const draftCount = (posts ?? []).filter((post) => post.status === 'draft').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Bài viết</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {posts?.length ?? 0} bài viết · {draftCount} nháp
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/bai-viet/import" className="btn-secondary">
            <Upload size={16} /> Import Excel
          </Link>
          <Link href="/admin/bai-viet/tao-moi" className="btn-primary">
            <Plus size={16} /> Tạo mới
          </Link>
        </div>
      </div>

      <AdminPostsList
        posts={(posts ?? []).map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          platform: post.platform,
          status: post.status,
          views: post.views,
        }))}
      />
    </div>
  )
}
