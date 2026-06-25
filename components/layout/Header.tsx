'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import SearchBar from '@/components/ui/SearchBar'
import { Menu, X, Zap } from 'lucide-react'
import { PLATFORMS } from '@/types'
import { useScrollDirection } from '@/hooks/useScrollDirection'

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAtTop, isScrollingDown } = useScrollDirection({ threshold: 10, topOffset: 20 })
  const scrolled = !isAtTop

  // Close mobile menu on route change
  useEffect(() => {
    let ignore = false
    if (!ignore) {
      setMenuOpen(false)
    }
    return () => { ignore = true }
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        transform: isScrollingDown && !menuOpen ? 'translateY(-100%)' : 'translateY(0)',
        background: scrolled
          ? 'rgba(var(--bg-primary-rgb, 255,255,255), 0.9)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 20px var(--shadow-color)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span
              className="font-extrabold text-xl tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Thủ Thuật{' '}
              <span className="gradient-text">MXH</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {PLATFORMS.map((p) => (
              <Link
                key={p.value}
                href={`/?platform=${p.value}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{
                  color: pathname === '/' ? 'var(--text-secondary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${p.color}15`
                  e.currentTarget.style.color = p.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                {p.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            <ThemeToggle />
            {/* Mobile menu button */}
            <button
              className="md:hidden min-h-11 min-w-11 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t animate-fade-in"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="px-4 py-4 space-y-1">
            {PLATFORMS.map((p) => (
              <Link
                key={p.value}
                href={`/?platform=${p.value}`}
                className="flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-all"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${p.color}15`
                  e.currentTarget.style.color = p.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
