import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePostBanner } from '@/lib/banner-generator'
import { parseImportWorkbook } from '@/lib/excel-import'

interface ImportResultItem {
  rowNumber: number
  title: string
  slug: string
  status: 'success' | 'error'
  message: string
  coverImage?: string | null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const generateBanner = formData.get('generateBanner') !== 'false'

    if (!file) {
      return NextResponse.json({ error: 'Vui lòng chọn file Excel.' }, { status: 400 })
    }

    if (!file.name.match(/\.xlsx?$/i)) {
      return NextResponse.json({ error: 'Chỉ hỗ trợ file .xlsx hoặc .xls.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File Excel không được lớn hơn 5MB.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const { rows, errors: parseErrors } = parseImportWorkbook(buffer)

    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug')

    const categoryMap = new Map((categories ?? []).map((category) => [category.slug, category.id]))
    const results: ImportResultItem[] = parseErrors.map((error) => ({
      rowNumber: error.rowNumber,
      title: '',
      slug: '',
      status: 'error',
      message: error.message,
    }))

    let successCount = 0

    for (const row of rows) {
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', row.slug)
        .maybeSingle()

      if (existingPost) {
        results.push({
          rowNumber: row.rowNumber,
          title: row.title,
          slug: row.slug,
          status: 'error',
          message: `Slug "${row.slug}" đã tồn tại.`,
        })
        continue
      }

      let categoryId: string | null = null
      if (row.categorySlug) {
        categoryId = categoryMap.get(row.categorySlug) ?? null
        if (!categoryId) {
          results.push({
            rowNumber: row.rowNumber,
            title: row.title,
            slug: row.slug,
            status: 'error',
            message: `Không tìm thấy danh mục "${row.categorySlug}".`,
          })
          continue
        }
      }

      let coverImage = row.coverImageUrl ?? null

      if (!coverImage && generateBanner) {
        try {
          coverImage = await generatePostBanner({
            title: row.title,
            content: row.content,
            excerpt: row.excerpt,
            platform: row.platform,
          })
        } catch (bannerError) {
          console.error('Banner generation failed:', bannerError)
          results.push({
            rowNumber: row.rowNumber,
            title: row.title,
            slug: row.slug,
            status: 'error',
            message: 'Không thể tạo ảnh banner. Kiểm tra cấu hình Cloudinary.',
          })
          continue
        }
      }

      const { error: insertError } = await supabase.from('posts').insert({
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt,
        platform: row.platform,
        category_id: categoryId,
        tags: row.tags,
        cover_image: coverImage,
        status: row.status,
        meta_title: row.metaTitle,
        meta_description: row.metaDescription,
      })

      if (insertError) {
        results.push({
          rowNumber: row.rowNumber,
          title: row.title,
          slug: row.slug,
          status: 'error',
          message: insertError.message,
        })
        continue
      }

      successCount += 1
      results.push({
        rowNumber: row.rowNumber,
        title: row.title,
        slug: row.slug,
        status: 'success',
        message: coverImage ? 'Import thành công và đã tạo banner.' : 'Import thành công.',
        coverImage,
      })
    }

    return NextResponse.json({
      totalRows: rows.length,
      successCount,
      errorCount: results.filter((item) => item.status === 'error').length,
      results,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import thất bại.' },
      { status: 500 }
    )
  }
}
