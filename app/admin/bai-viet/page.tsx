
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamic = "force-dynamic";
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Eye, Edit } from 'lucide-react'
import AdminPostActions from '@/components/admin/AdminPostActions'

export default async function AdminPostsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id,title,slug,platform,status,views,created_at,category:categories(name)')
    .order('created_at', { ascending: false })

  const platformEmojis: Record<string, string> = {
    facebook: '📘', tiktok: '🎵', instagram: '📸', youtube: '▶️',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Bài viết</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {posts?.length ?? 0} bài viết
          </p>
        </div>
        <Link href="/admin/bai-viet/tao-moi" className="btn-primary">
          <Plus size={16} /> Tạo mới
        </Link>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
        >
          <div className="col-span-6">Tiêu đề</div>
          <div className="col-span-2 hidden sm:block">Nền tảng</div>
          <div className="col-span-2 hidden sm:block">Trạng thái</div>
          <div className="col-span-1 hidden sm:block text-center">Lượt xem</div>
          <div className="col-span-1 text-right">Hành động</div>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {(posts ?? []).map((post) => (
            <div
              key={post.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <div className="col-span-6 min-w-0">
                <p className="font-semibold truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                  {post.title}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {post.slug}
                </p>
              </div>
              <div className="col-span-2 hidden sm:block">
                <span className="text-sm">
                  {platformEmojis[post.platform] ?? '📱'}{' '}
                  <span style={{ color: 'var(--text-secondary)' }} className="capitalize">{post.platform}</span>
                </span>
              </div>
              <div className="col-span-2 hidden sm:block">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: post.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: post.status === 'published' ? '#10b981' : '#f59e0b',
                  }}
                >
                  {post.status === 'published' ? 'Xuất bản' : 'Nháp'}
                </span>
              </div>
              <div className="col-span-1 hidden sm:flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Eye size={11} /> {post.views}
              </div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <Link
                  href={`/bai-viet/${post.slug}`}
                  target="_blank"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ color: 'var(--text-muted)' }}
                  title="Xem bài viết"
                >
                  <Eye size={14} />
                </Link>
                <Link
                  href={`/admin/bai-viet/${post.id}/chinh-sua`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(14,144,224,0.1)]"
                  style={{ color: 'var(--accent)' }}
                  title="Chỉnh sửa"
                >
                  <Edit size={14} />
                </Link>
                <AdminPostActions postId={post.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
