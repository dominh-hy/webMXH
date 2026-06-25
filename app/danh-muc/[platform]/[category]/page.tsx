import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPosts, getCategoryBySlug } from '@/lib/supabase/queries'
import { PLATFORM_MAP } from '@/types'
import type { Platform } from '@/types'
import Breadcrumb from '@/components/layout/Breadcrumb'
import InfinitePostGrid from '@/components/posts/InfinitePostGrid'

interface CategoryPageProps {
  params: Promise<{ platform: string; category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { platform, category } = await params
  const cat = await getCategoryBySlug(platform, category)
  if (!cat) return { title: 'Không tìm thấy danh mục' }

  const p = PLATFORM_MAP[platform as Platform]

  return {
    title: `${cat.name} – Thủ Thuật ${p?.label ?? platform}`,
    description: cat.description ?? `Tổng hợp thủ thuật ${cat.name} trên ${p?.label ?? platform} mới nhất.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { platform, category } = await params
  const cat = await getCategoryBySlug(platform, category)

  if (!cat) notFound()

  const platformInfo = PLATFORM_MAP[platform as Platform]

  const { data: initialPosts, hasMore } = await getPosts({
    platform: platform as Platform,
    page: 1,
    pageSize: 9,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[
        { label: platformInfo?.label ?? platform, href: `/?platform=${platform}` },
        { label: cat.name },
      ]} />

      {/* Category Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold mb-2"
          style={{ color: platformInfo?.color ?? 'var(--text-primary)' }}
        >
          {cat.name}
        </h1>
        {cat.description && (
          <p className="text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            {cat.description}
          </p>
        )}
      </div>

      <InfinitePostGrid
        initialPosts={initialPosts}
        initialHasMore={hasMore}
        platform={platform as Platform}
      />
    </div>
  )
}
