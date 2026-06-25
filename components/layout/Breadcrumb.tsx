import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const all = [{ label: 'Trang chủ', href: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol
        className="flex items-center flex-wrap gap-1 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        {all.map((item, idx) => {
          const isLast = idx === all.length - 1
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx === 0 && <Home size={13} />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--accent)] transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-semibold' : ''}
                  style={{ color: isLast ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={13} className="opacity-50" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
