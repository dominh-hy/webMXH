import { Suspense } from 'react'
import type { Metadata } from 'next'
import SearchResultsClient from './SearchResultsClient'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Kết quả tìm kiếm: "${q}"` : 'Tìm kiếm',
    description: q ? `Tìm kiếm thủ thuật mạng xã hội với từ khoá "${q}"` : 'Tìm kiếm thủ thuật mạng xã hội',
    robots: { index: false },
    verification: {
      google: '77qOlDqHLf9prEx1DF-FK8jIptHiYuHeyvxSsm2mBxM',
    },
  }
}

function SearchPageFallback() {
  return (
    <>
      <div className="mb-6 h-8 w-64 animate-pulse rounded-xl" style={{ background: 'var(--bg-card)' }} />
      <div className="h-40 animate-pulse rounded-xl" style={{ background: 'var(--bg-card)' }} />
    </>
  )
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  const { q } = await searchParams

  return (
    <>
      <h1 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
        🔍 {q ? `Kết quả cho "${q}"` : 'Tìm kiếm'}
      </h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl" style={{ background: 'var(--bg-card)' }} />}>
        <SearchResultsClient initialQuery={q ?? ''} />
      </Suspense>
    </>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<SearchPageFallback />}>
        <SearchPageContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
