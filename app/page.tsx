import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { Platform } from '@/types'
import { PLATFORM_MAP, PLATFORMS } from '@/types'
import { getPosts } from '@/lib/supabase/queries'
import PlatformFilter from '@/components/posts/PlatformFilter'
import InfinitePostGrid from '@/components/posts/InfinitePostGrid'
import { TrendingUp, Sparkles } from 'lucide-react'

interface HomeProps {
  searchParams: Promise<{ platform?: string }>
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const params = await searchParams
  const platform = params.platform as Platform | undefined
  if (platform && PLATFORM_MAP[platform]) {
    const p = PLATFORM_MAP[platform]
    return {
      title: `Thủ Thuật ${p.label} – Tips & Tricks Mới Nhất`,
      description: `Khám phá các thủ thuật ${p.label} mới nhất giúp tăng tương tác và phát triển kênh hiệu quả.`,
      verification: {
        google: '77qOlDqHLf9prEx1DF-FK8jIptHiYuHeyvxSsm2mBxM',
      },
    }
  }
  return {
    verification: {
      google: '77qOlDqHLf9prEx1DF-FK8jIptHiYuHeyvxSsm2mBxM',
    },
  }
}

function HeroSectionSkeleton() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 animate-pulse">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto" />
        <div className="h-12 w-3/4 sm:w-1/2 bg-gray-300 dark:bg-gray-700 rounded-2xl mx-auto" />
        <div className="h-4 w-2/3 sm:w-1/3 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
      </div>
    </section>
  )
}

async function HeroSectionContainer({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const params = await searchParams
  const platform = params.platform as Platform | undefined
  const p = platform ? PLATFORM_MAP[platform] : null

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: p
            ? `radial-gradient(ellipse at top, ${p.color}50 0%, transparent 70%)`
            : 'radial-gradient(ellipse at top, #0e90e040 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {p ? (
          <>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-in-up">
              <span className="gradient-text">Thủ Thuật {p.label}</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto animate-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '100ms' }}>
              Bí kíp tăng tương tác và phát triển trên {p.label} hiệu quả nhất
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold animate-fade-in"
              style={{ background: 'rgba(14,144,224,0.1)', color: 'var(--accent)', border: '1px solid rgba(14,144,224,0.2)' }}>
              <Sparkles size={14} />
              Cập nhật hàng ngày
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 animate-fade-in-up leading-tight">
              Thủ Thuật{' '}
              <span className="gradient-text">Mạng Xã Hội</span>
              <br />Hàng Đầu Việt Nam
            </h1>
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-up mb-8"
              style={{ color: 'var(--text-secondary)', animationDelay: '100ms' }}
            >
              Khám phá hàng trăm tips & tricks giúp bạn tăng tương tác, phát triển kênh và kiếm tiền từ mạng xã hội
            </p>
            <div className="flex items-center justify-center gap-6 text-sm animate-fade-in-up" style={{ animationDelay: '200ms', color: 'var(--text-muted)' }}>
              {PLATFORMS.map((plat) => (
                <span key={plat.value} className="flex items-center gap-1">
                  {plat.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card flex flex-col h-full animate-pulse pointer-events-none">
          {/* Cover Image Placeholder */}
          <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden" />
          
          {/* Content Placeholder */}
          <div className="p-4 flex flex-col flex-1 gap-3">
            {/* Category Placeholder */}
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/4" />
            
            {/* Title Placeholder */}
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-11/12" />
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            
            {/* Excerpt Placeholder */}
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
            
            {/* Footer Placeholder */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 mt-auto">
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function PostGridContainer({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const params = await searchParams
  const platform = params.platform as Platform | undefined
  const { data: initialPosts, hasMore } = await getPosts({
    platform,
    page: 1,
    pageSize: 9,
  })

  return (
    <InfinitePostGrid
      initialPosts={initialPosts}
      initialHasMore={hasMore}
      platform={platform}
    />
  )
}

async function SectionTitleContainer({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const params = await searchParams
  const platform = params.platform as Platform | undefined
  return (
    <h2 className="section-title text-xl">
      {platform ? `Thủ thuật ${PLATFORM_MAP[platform]?.label}` : 'Bài viết mới nhất'}
    </h2>
  )
}

export default function HomePage({ searchParams }: HomeProps) {
  return (
    <>
      <Suspense fallback={<HeroSectionSkeleton />}>
        <HeroSectionContainer searchParams={searchParams} />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Suspense fallback={<h2 className="section-title text-xl">Bài viết mới nhất</h2>}>
              <SectionTitleContainer searchParams={searchParams} />
            </Suspense>
          </div>

          {/* Platform filter */}
          <Suspense fallback={<div className="h-10 w-64 skeleton rounded-xl" />}>
            <PlatformFilter />
          </Suspense>
        </div>

        {/* Post grid with infinite scroll */}
        <Suspense fallback={<PostGridSkeleton />}>
          <PostGridContainer searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  )
}
