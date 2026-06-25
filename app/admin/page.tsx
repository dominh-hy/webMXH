import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Eye, Tag, Plus, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: draftPosts },
    { count: totalTags },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('id,title,slug,platform,status,views,created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Tổng bài viết', value: totalPosts ?? 0, icon: FileText, color: '#0e90e0', bg: 'rgba(14,144,224,0.1)' },
    { label: 'Đã xuất bản', value: publishedPosts ?? 0, icon: Eye, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Bản nháp', value: draftPosts ?? 0, icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Tags', value: totalTags ?? 0, icon: Tag, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ]

  const platformEmojis: Record<string, string> = {
    facebook: '📘', tiktok: '🎵', instagram: '📸', youtube: '▶️',
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Tổng quan hệ thống Thủ Thuật MXH
          </p>
        </div>
        <Link href="/admin/bai-viet/tao-moi" className="btn-primary">
          <Plus size={16} />
          Tạo bài viết
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Bài viết gần đây</h2>
          <Link href="/admin/bai-viet" className="text-sm" style={{ color: 'var(--accent)' }}>
            Xem tất cả →
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {(recentPosts ?? []).map((post) => (
            <div key={post.id} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-card-hover)] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg flex-shrink-0">{platformEmojis[post.platform] ?? '📱'}</span>
                <div className="min-w-0">
                  <p className="font-medium truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                    {post.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: post.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: post.status === 'published' ? '#10b981' : '#f59e0b',
                  }}
                >
                  {post.status === 'published' ? 'Xuất bản' : 'Nháp'}
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Eye size={11} /> {post.views}
                </span>
                <Link
                  href={`/admin/bai-viet/${post.id}/chinh-sua`}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Sửa
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
