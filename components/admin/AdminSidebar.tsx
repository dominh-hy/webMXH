'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  FileText,
  Tags,
  FolderTree,
  Share2,
  LogOut,
  Zap,
  Plus,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react'
import { useState } from 'react'

interface AdminSidebarProps {
  user: User
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bai-viet', label: 'Bài viết', icon: FileText },
  { href: '/admin/danh-muc', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/nen-tang', label: 'Nền tảng', icon: Share2 },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
]

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="flex flex-col transition-all duration-300 sticky top-0 h-screen"
      style={{
        width: collapsed ? '64px' : '240px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Zap size={13} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              Admin Panel
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors ml-auto"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`admin-nav-item ${isActive(href, exact) ? 'active' : ''}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* Quick: New Post */}
        <div className="pt-2">
          <Link
            href="/admin/bai-viet/tao-moi"
            title={collapsed ? 'Tạo bài viết mới' : undefined}
            className="admin-nav-item text-[var(--accent)] hover:bg-[rgba(14,144,224,0.1)]"
          >
            <Plus size={18} className="flex-shrink-0" />
            {!collapsed && <span>Tạo bài viết mới</span>}
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="admin-nav-item"
          title={collapsed ? 'Xem website' : undefined}
        >
          <ExternalLink size={16} className="flex-shrink-0" />
          {!collapsed && <span>Xem website</span>}
        </Link>

        {/* User info */}
        {!collapsed && (
          <div
            className="px-3 py-2 rounded-xl text-xs truncate"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            {user.email}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="admin-nav-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}
