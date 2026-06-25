'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PLATFORMS } from '@/types'
import type { Platform } from '@/types'

export default function PlatformFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('platform') as Platform | null

  function setFilter(platform: Platform | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (platform) {
      params.set('platform', platform)
    } else {
      params.delete('platform')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => setFilter(null)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
        style={{
          background: !active
            ? 'linear-gradient(135deg, #0e90e0, #7c3aed)'
            : 'var(--bg-card)',
          color: !active ? 'white' : 'var(--text-secondary)',
          border: !active ? 'none' : '1.5px solid var(--border-color)',
          boxShadow: !active ? '0 4px 12px rgba(14,144,224,0.3)' : 'none',
        }}
      >
        🌐 Tất cả
      </button>

      {PLATFORMS.map((p) => {
        const isActive = active === p.value
        return (
          <button
            key={p.value}
            onClick={() => setFilter(p.value)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: isActive ? p.color : 'var(--bg-card)',
              color: isActive ? 'white' : 'var(--text-secondary)',
              border: isActive ? 'none' : '1.5px solid var(--border-color)',
              boxShadow: isActive ? `0 4px 12px ${p.color}40` : 'none',
            }}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
