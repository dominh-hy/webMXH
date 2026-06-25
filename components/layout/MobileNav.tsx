'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Grid3X3, Home, Search } from 'lucide-react'

type MobileNavItem = {
  href: string
  label: string
  match: (pathname: string) => boolean
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

interface MobileNavProps {
  bookmarksHref?: string
}

export default function MobileNav({ bookmarksHref = '/bookmark' }: MobileNavProps) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return null
  }

  const items: MobileNavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      match: (path) => path === '/',
    },
    {
      href: '/tim-kiem',
      label: 'Tim kiem',
      icon: Search,
      match: (path) => path.startsWith('/tim-kiem'),
    },
    {
      href: '/danh-muc',
      label: 'Danh muc',
      icon: Grid3X3,
      match: (path) => path.startsWith('/danh-muc'),
    },
    {
      href: bookmarksHref,
      label: 'Bookmark',
      icon: Bookmark,
      match: (path) => path.startsWith(bookmarksHref),
    },
  ]

  return (
    <>
      <nav
        aria-label="Mobile primary navigation"
        className="fixed inset-x-0 bottom-0 z-50 md:hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'color-mix(in srgb, var(--bg-card) 92%, transparent)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -10px 30px var(--shadow-color)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <ul className="mx-auto grid h-16 max-w-md grid-cols-4 px-2">
          {items.map((item) => {
            const active = item.match(pathname)
            const Icon = item.icon

            return (
              <li key={item.href} className="flex items-center justify-center">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-xs font-semibold transition-colors"
                  style={{
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    background: active ? 'rgba(14, 144, 224, 0.1)' : 'transparent',
                  }}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  <span className="leading-none">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div aria-hidden="true" className="h-20 md:hidden" />
    </>
  )
}
