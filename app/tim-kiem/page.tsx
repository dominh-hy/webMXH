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
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
        🔍 {q ? `Kết quả cho "${q}"` : 'Tìm kiếm'}
      </h1>
      <Suspense fallback={<div className="h-40 skeleton rounded-xl" />}>
        <SearchResultsClient initialQuery={q ?? ''} />
      </Suspense>
    </div>
  )
}
