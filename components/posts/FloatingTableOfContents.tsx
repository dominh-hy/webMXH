'use client'

import { useState } from 'react'
import { List, X } from 'lucide-react'

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

interface FloatingTableOfContentsProps {
  items: TocItem[]
}

export default function FloatingTableOfContents({ items }: FloatingTableOfContentsProps) {
  const [open, setOpen] = useState(false)

  if (items.length < 3) return null

  return (
    <aside className="fixed bottom-24 right-4 z-40 md:bottom-auto md:right-6 md:top-28">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full shadow-xl transition-colors"
        style={{
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
        aria-label={open ? 'Dong muc luc' : 'Mo muc luc'}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <List size={20} />}
      </button>

      {open && (
        <nav
          aria-label="Muc luc bai viet"
          className="absolute bottom-14 right-0 max-h-[52vh] w-[min(82vw,320px)] overflow-y-auto rounded-xl p-3 shadow-2xl md:bottom-auto md:top-14"
          style={{
            background: 'color-mix(in srgb, var(--bg-card) 94%, transparent)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <p className="mb-2 px-2 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
            Muc luc
          </p>
          <ol className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="block min-h-11 rounded-lg px-3 py-2 text-sm leading-snug transition-colors hover:bg-[var(--bg-card-hover)]"
                  style={{
                    color: 'var(--text-secondary)',
                    paddingLeft: item.level === 3 ? '1.5rem' : '0.75rem',
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </aside>
  )
}
