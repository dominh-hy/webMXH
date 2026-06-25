import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], count: 0 })
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('search_posts', {
      query: q,
      lim: 20,
      off: 0,
    })

    if (error) throw error

    return NextResponse.json({ results: data ?? [], count: data?.length ?? 0 })
  } catch {
    // Fallback: ilike search
    const { data } = await supabase
      .from('posts')
      .select('id,title,slug,excerpt,platform,cover_image,views,created_at')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ results: data ?? [], count: data?.length ?? 0 })
  }
}
