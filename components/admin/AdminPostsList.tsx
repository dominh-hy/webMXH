'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminPostActions from '@/components/admin/AdminPostActions'
import { CheckCircle2, Edit, Eye, Loader2 } from 'lucide-react'

interface AdminPostListItem {
  id: string
  title: string
  slug: string
  platform: string | null
  status: 'draft' | 'published'
  views: number
}

interface AdminPostsListProps {
  posts: AdminPostListItem[]
}

const platformEmojis: Record<string, string> = {
  facebook: '📘',
  tiktok: '🎵',
  instagram: '📸',
  youtube: '▶️',
}

export default function AdminPostsList({ posts }: AdminPostsListProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loadingAction, setLoadingAction] = useState<'selected' | 'all' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const draftPosts = useMemo(
    () => posts.filter((post) => post.status === 'draft'),
    [posts]
  )
  const draftIds = useMemo(() => draftPosts.map((post) => post.id), [draftPosts])
  const allDraftsSelected = draftIds.length > 0 && draftIds.every((id) => selectedIds.includes(id))

  function togglePost(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  function toggleSelectAllDrafts() {
    setSelectedIds(allDraftsSelected ? [] : draftIds)
  }

  async function publishPosts(payload: { ids?: string[]; all?: boolean }) {
    const response = await fetch('/api/admin/posts/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as { publishedCount?: number; error?: string }
    if (!response.ok) {
      throw new Error(data.error ?? 'Xuất bản thất bại.')
    }

    return data.publishedCount ?? 0
  }

  async function handlePublishSelected() {
    if (selectedIds.length === 0) {
      setMessage('Vui lòng chọn ít nhất một bài nháp.')
      return
    }

    setLoadingAction('selected')
    setMessage(null)

    try {
      const count = await publishPosts({ ids: selectedIds })
      setSelectedIds([])
      setMessage(`Đã xuất bản ${count} bài viết.`)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Xuất bản thất bại.')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handlePublishAll() {
    if (draftPosts.length === 0) {
      setMessage('Không còn bài nháp nào để xuất bản.')
      return
    }

    if (!confirm(`Xuất bản tất cả ${draftPosts.length} bài nháp?`)) return

    setLoadingAction('all')
    setMessage(null)

    try {
      const count = await publishPosts({ all: true })
      setSelectedIds([])
      setMessage(`Đã xuất bản ${count} bài viết.`)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Xuất bản thất bại.')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <>
      <div
        className="mb-4 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {selectedIds.length > 0
            ? `Đã chọn ${selectedIds.length} bài`
            : `${draftPosts.length} bài nháp có thể xuất bản`}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePublishSelected}
            disabled={loadingAction !== null || selectedIds.length === 0}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === 'selected' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Xuất bản đã chọn
          </button>
          <button
            type="button"
            onClick={handlePublishAll}
            disabled={loadingAction !== null || draftPosts.length === 0}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === 'all' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Xuất bản tất cả
          </button>
        </div>
      </div>

      {message && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{
            background: message.includes('thất bại') || message.includes('Vui lòng')
              ? 'rgba(239,68,68,0.1)'
              : 'rgba(16,185,129,0.1)',
            color: message.includes('thất bại') || message.includes('Vui lòng') ? '#ef4444' : '#10b981',
            border: `1px solid ${message.includes('thất bại') || message.includes('Vui lòng') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          }}
        >
          {message}
        </div>
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div
          className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
        >
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allDraftsSelected}
              onChange={toggleSelectAllDrafts}
              disabled={draftPosts.length === 0}
              aria-label="Chọn tất cả bài nháp"
              className="h-4 w-4"
            />
          </div>
          <div className="col-span-5">Tiêu đề</div>
          <div className="col-span-2 hidden sm:block">Nền tảng</div>
          <div className="col-span-2 hidden sm:block">Trạng thái</div>
          <div className="col-span-1 hidden sm:block text-center">Lượt xem</div>
          <div className="col-span-1 text-right">Hành động</div>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {posts.map((post) => {
            const isDraft = post.status === 'draft'
            const isSelected = selectedIds.includes(post.id)

            return (
              <div
                key={post.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePost(post.id)}
                    disabled={!isDraft}
                    aria-label={`Chọn ${post.title}`}
                    className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>

                <div className="col-span-5 min-w-0">
                  <p className="font-semibold truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                    {post.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {post.slug}
                  </p>
                </div>

                <div className="col-span-2 hidden sm:block">
                  <span className="text-sm">
                    {platformEmojis[post.platform ?? ''] ?? '📱'}{' '}
                    <span style={{ color: 'var(--text-secondary)' }} className="capitalize">
                      {post.platform}
                    </span>
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
            )
          })}
        </div>
      </div>
    </>
  )
}
