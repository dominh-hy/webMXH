import Link from 'next/link'
import { Zap, Heart } from 'lucide-react'
import { PLATFORMS } from '@/types'

export default function Footer() {
  const currentYear = 2025

  return (
    <footer
      className="mt-16 border-t"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="font-extrabold text-xl" style={{ color: 'var(--text-primary)' }}>
                Thủ Thuật <span className="gradient-text">MXH</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-muted)' }}>
              Khám phá hàng trăm thủ thuật, mẹo vặt và bí kíp tăng tương tác trên các nền tảng mạng xã hội hàng đầu.
            </p>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Nền Tảng
            </h3>
            <ul className="space-y-2">
              {PLATFORMS.map((p) => (
                <li key={p.value}>
                  <Link
                    href={`/?platform=${p.value}`}
                    className="text-sm transition-colors hover:text-[var(--accent)] flex items-center gap-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Liên Kết
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Trang Chủ' },
                { href: '/tim-kiem', label: 'Tìm Kiếm' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <p className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            © {currentYear} Thủ Thuật MXH. Made with{' '}
            <Heart size={12} className="text-red-500" fill="currentColor" /> in Việt Nam
          </p>

        </div>
      </div>
    </footer>
  )
}
