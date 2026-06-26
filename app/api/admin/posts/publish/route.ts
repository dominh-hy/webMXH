import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as { ids?: string[]; all?: boolean }
    const publishAll = body.all === true
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : []

    if (!publishAll && ids.length === 0) {
      return NextResponse.json({ error: 'Chưa chọn bài viết nào.' }, { status: 400 })
    }

    let query = supabase
      .from('posts')
      .update({ status: 'published' })
      .eq('status', 'draft')

    if (!publishAll) {
      query = query.in('id', ids)
    }

    const { data, error } = await query.select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      publishedCount: data?.length ?? 0,
    })
  } catch (error) {
    console.error('Bulk publish error:', error)
    return NextResponse.json({ error: 'Xuất bản thất bại.' }, { status: 500 })
  }
}
