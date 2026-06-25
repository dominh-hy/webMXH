'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Post } from '@/types'
import type { Platform } from '@/types'
import PostCard from './PostCard'
import { Loader2 } from 'lucide-react'

interface InfinitePostGridProps {
  initialPosts: Post[]
  initialHasMore: boolean
  platform?: Platform
}

const PAGE_SIZE = 9

export default function InfinitePostGrid({ initialPosts, initialHasMore, platform }: InfinitePostGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // Reset when platform changes
  useEffect(() => {
    let ignore = false
    if (!ignore) {
      setPosts(initialPosts)
      setPage(1)
      setHasMore(initialHasMore)
    }
    return () => { ignore = true }
  }, [initialPosts, initialHasMore, platform])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)

    try {
      const nextPage = page + 1
      const params = new URLSearchParams({ page: String(nextPage), pageSize: String(PAGE_SIZE) })
      if (platform) params.set('platform', platform)

      const res = await fetch(`/api/posts?${params.toString()}`)
      const data = await res.json()

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const newPosts = (data.data as Post[]).filter((p) => !existingIds.has(p.id))
        return [...prev, ...newPosts]
      })
      setPage(nextPage)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('Failed to load more posts:', err)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [hasMore, page, platform])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Chưa có bài viết nào
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
          {platform ? `Chưa có thủ thuật nào cho nền tảng này.` : 'Hãy quay lại sau nhé!'}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${(idx % PAGE_SIZE) * 60}ms` }}>
            <PostCard post={post} index={idx % PAGE_SIZE} />
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-8 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Đang tải thêm...</span>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Đã hiển thị tất cả {posts.length} bài viết
          </p>
        )}
      </div>
    </div>
  )
}
