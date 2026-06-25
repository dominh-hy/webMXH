'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let ignore = false
    if (!ignore) {
      setMounted(true)
    }
    return () => { ignore = true }
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl skeleton" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
      style={{
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border-color)',
        color: 'var(--text-secondary)',
      }}
      aria-label={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
    >
      {theme === 'dark' ? (
        <Sun size={16} className="text-yellow-400" />
      ) : (
        <Moon size={16} />
      )}
    </button>
  )
}
