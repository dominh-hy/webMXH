'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import type { SearchResult } from '@/types'
import { PLATFORM_MAP } from '@/types'
import { formatRelativeDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(query), 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, search])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
          style={{
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--border-color)',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Tìm kiếm thủ thuật..."
            className="flex-1 bg-transparent text-sm outline-none min-w-0"
            style={{ color: 'var(--text-primary)' }}
          />
          {loading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              className="hover:text-red-500 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown results */}
      {open && (results.length > 0 || (query.length >= 2 && !loading)) && (
        <div
          className="absolute top-full mt-2 left-0 right-0 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {results.length === 0 ? (
            <div className="p-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              <div
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}
              >
                {results.length} kết quả
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/bai-viet/${r.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 p-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      {r.cover_image && (
                        <Image
                          src={r.cover_image}
                          alt={r.title}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        {r.platform && (
                          <span
                            className={`platform-badge badge-${r.platform} mb-1`}
                          >
                            {PLATFORM_MAP[r.platform]?.emoji} {PLATFORM_MAP[r.platform]?.label}
                          </span>
                        )}
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {r.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatRelativeDate(r.created_at)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={handleSubmit as unknown as React.MouseEventHandler}
                  className="w-full p-3 text-sm font-semibold text-center transition-colors hover:bg-[var(--bg-card-hover)]"
                  style={{ color: 'var(--accent)' }}
                >
                  Xem tất cả kết quả cho &ldquo;{query}&rdquo; →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
