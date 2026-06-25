import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategories } from '@/lib/supabase/queries'
import { PLATFORM_MAP } from '@/types'

export const metadata: Metadata = {
  title: 'Danh muc',
  description: 'Tat ca danh muc thu thuat mang xa hoi.',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
          Danh muc
        </h1>
        <p className="mt-2 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Chon nhanh chu de ban muon doc tren Facebook, TikTok, Instagram va YouTube.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map((category) => {
          const platform = category.platform && category.platform !== 'all'
            ? PLATFORM_MAP[category.platform]
            : null
          const href = category.platform && category.platform !== 'all'
            ? `/danh-muc/${category.platform}/${category.slug}`
            : '/'

          return (
            <Link
              key={category.id}
              href={href}
              className="flex min-h-20 items-center gap-3 rounded-xl p-4 transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: 'var(--bg-secondary)' }}>
                {category.icon ?? platform?.emoji ?? '#'}
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{category.name}</span>
                <span className="mt-1 block text-sm" style={{ color: 'var(--text-muted)' }}>
                  {platform?.label ?? 'Tat ca nen tang'}
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
