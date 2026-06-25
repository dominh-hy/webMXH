'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import type { SearchResult } from '@/types'
import { PLATFORM_MAP } from '@/types'
import { formatRelativeDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface SearchResultsClientProps {
  initialQuery: string
}

export default function SearchResultsClient({ initialQuery }: SearchResultsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(query), 400)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, doSearch])

  useEffect(() => {
    let ignore = false
    if (initialQuery) {
      if (!ignore) {
        doSearch(initialQuery)
      }
    }
    return () => { ignore = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) params.set('q', query.trim())
    else params.delete('q')
    router.push(`/tim-kiem?${params.toString()}`)
  }

  return (
    <div>
      {/* Search input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div
          className="flex items-center gap-3 p-3 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)' }}
        >
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khoá tìm kiếm..."
            className="flex-1 bg-transparent text-base outline-none"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
          {loading && <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Tìm kiếm</button>
        </div>
      </form>

      {/* Results */}
      {!loading && query.trim().length >= 2 && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Tìm thấy <strong>{results.length}</strong> kết quả cho &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((r, i) => {
            const platform = r.platform ? PLATFORM_MAP[r.platform] : null
            return (
              <Link
                key={r.id}
                href={`/bai-viet/${r.slug}`}
                className="card flex gap-4 p-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {r.cover_image && (
                  <div className="relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden">
                    <Image src={r.cover_image} alt={r.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {platform && (
                    <span className={`platform-badge badge-${r.platform} mb-1.5`}>
                      {platform.emoji} {platform.label}
                    </span>
                  )}
                  <h2 className="font-bold text-base leading-snug line-clamp-1 mb-1" style={{ color: 'var(--text-primary)' }}>
                    {r.title}
                  </h2>
                  {r.excerpt && (
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.excerpt}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {formatRelativeDate(r.created_at)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : !loading && query.trim().length >= 2 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Không tìm thấy kết quả</p>
          <p style={{ color: 'var(--text-muted)' }}>Thử tìm với từ khoá khác nhé!</p>
        </div>
      ) : null}
    </div>
  )
}
