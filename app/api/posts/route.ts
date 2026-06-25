import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Platform } from '@/types'

const PAGE_SIZE = 9

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform') as Platform | null
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') ?? String(PAGE_SIZE), 10)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('*, category:categories(id,name,slug,platform,icon)', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Failed to load posts API:', error.message)
    return NextResponse.json({
      data: [],
      count: 0,
      page,
      pageSize,
      hasMore: false,
    })
  }

  return NextResponse.json({
    data: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > to + 1,
  })
}
