import { createClient } from '@/lib/supabase/server'
import { PLATFORMS } from '@/types'
import type { Platform } from '@/types'
import { Share2, FileText, Eye, TrendingUp, BarChart3 } from 'lucide-react'

async function getPlatformStats() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('platform, status, views')

  if (!data) return []

  const statsMap: Record<string, {
    total: number
    published: number
    draft: number
    views: number
  }> = {}

  for (const post of data) {
    const p = post.platform ?? 'other'
    if (!statsMap[p]) {
      statsMap[p] = { total: 0, published: 0, draft: 0, views: 0 }
    }
    statsMap[p].total++
    if (post.status === 'published') statsMap[p].published++
    else statsMap[p].draft++
    statsMap[p].views += post.views ?? 0
  }

  return PLATFORMS.map((plat) => ({
    ...plat,
    stats: statsMap[plat.value] ?? { total: 0, published: 0, draft: 0, views: 0 },
  }))
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export default async function AdminPlatformPage() {
  const platformStats = await getPlatformStats()

  const totalPosts = platformStats.reduce((s, p) => s + p.stats.total, 0)
  const totalViews = platformStats.reduce((s, p) => s + p.stats.views, 0)
  const totalPublished = platformStats.reduce((s, p) => s + p.stats.published, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Share2 size={22} style={{ color: 'var(--accent)' }} />
          Thống kê Nền tảng
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Phân tích nội dung theo từng mạng xã hội
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Tổng bài viết', value: formatNumber(totalPosts), icon: FileText, color: '#0e90e0' },
          { label: 'Đã xuất bản', value: formatNumber(totalPublished), icon: TrendingUp, color: '#10b981' },
          { label: 'Tổng lượt xem', value: formatNumber(totalViews), icon: Eye, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18`, color }}
            >
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Platform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {platformStats.map((plat) => {
          const publishedPct = plat.stats.total > 0
            ? Math.round((plat.stats.published / plat.stats.total) * 100)
            : 0

          return (
            <div
              key={plat.value}
              className="rounded-2xl p-5 transition-all duration-200 hover:shadow-lg"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              {/* Platform header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${plat.color}18` }}
                >
                  {plat.emoji}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{plat.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{plat.stats.total} bài viết</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Xuất bản</span>
                    <span className="font-semibold" style={{ color: plat.color }}>{publishedPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${publishedPct}%`, background: plat.color }}
                    />
                  </div>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-2.5 text-center" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-base font-extrabold" style={{ color: '#10b981' }}>{plat.stats.published}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Published</p>
                  </div>
                  <div className="rounded-xl p-2.5 text-center" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-base font-extrabold" style={{ color: '#f59e0b' }}>{plat.stats.draft}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nháp</p>
                  </div>
                </div>

                {/* Views */}
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Eye size={12} />
                    Lượt xem
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatNumber(plat.stats.views)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bar chart */}
      <div
        className="mt-6 rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Số bài viết theo nền tảng
          </h2>
        </div>
        <div className="space-y-3">
          {platformStats
            .filter((p) => p.stats.total > 0)
            .sort((a, b) => b.stats.total - a.stats.total)
            .map((plat) => {
              const maxTotal = Math.max(...platformStats.map((p) => p.stats.total), 1)
              const pct = (plat.stats.total / maxTotal) * 100

              return (
                <div key={plat.value} className="flex items-center gap-3">
                  <div className="w-6 text-base text-center flex-shrink-0">{plat.emoji}</div>
                  <div className="w-24 flex-shrink-0 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {plat.label}
                  </div>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                    <div
                      className="h-full rounded-full flex items-center px-2 transition-all duration-700"
                      style={{ width: `${Math.max(pct, 2)}%`, background: plat.color }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-bold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                    {plat.stats.total}
                  </div>
                </div>
              )
            })}
          {platformStats.every((p) => p.stats.total === 0) && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              Chưa có bài viết nào.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
