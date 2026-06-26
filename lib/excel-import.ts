import * as XLSX from 'xlsx'
import {
  buildPostSlug,
  buildSeoDescription,
  buildSeoTitle,
  getPlatformLabel,
  normalizePlatform,
  normalizeStatus,
  parseTags,
} from '@/lib/post-utils'
import { extractExcerpt } from '@/lib/utils'
import type { Platform, PostStatus } from '@/types'

export interface ImportRow {
  rowNumber: number
  title: string
  content: string
  platform: Platform
  categorySlug?: string
  tags: string[]
  status: PostStatus
  slug: string
  excerpt: string
  coverImageUrl?: string
  metaTitle: string
  metaDescription: string
}

export interface ImportRowError {
  rowNumber: number
  message: string
}

const HEADER_ALIASES: Record<string, keyof ParsedRowInput> = {
  tieu_de: 'title',
  title: 'title',
  'tiêu đề': 'title',
  noi_dung: 'content',
  content: 'content',
  'nội dung': 'content',
  nen_tang: 'platform',
  platform: 'platform',
  'nền tảng': 'platform',
  danh_muc: 'categorySlug',
  category: 'categorySlug',
  category_slug: 'categorySlug',
  'danh mục': 'categorySlug',
  tags: 'tags',
  tag: 'tags',
  trang_thai: 'status',
  status: 'status',
  'trạng thái': 'status',
  slug: 'slug',
  tom_tat: 'excerpt',
  excerpt: 'excerpt',
  'tóm tắt': 'excerpt',
  anh_bia: 'coverImageUrl',
  cover_image: 'coverImageUrl',
  cover_image_url: 'coverImageUrl',
  'ảnh bìa': 'coverImageUrl',
}

interface ParsedRowInput {
  title?: string
  content?: string
  platform?: string
  categorySlug?: string
  tags?: string
  status?: string
  slug?: string
  excerpt?: string
  coverImageUrl?: string
}

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
}

function cellToString(value: unknown) {
  if (value == null) return ''
  return String(value).trim()
}

function mapWorksheetRow(row: Record<string, unknown>) {
  const mapped: ParsedRowInput = {}

  for (const [header, value] of Object.entries(row)) {
    const key = HEADER_ALIASES[normalizeHeader(header)]
    if (!key) continue
    mapped[key] = cellToString(value)
  }

  return mapped
}

function isRowEmpty(row: ParsedRowInput) {
  return !row.title && !row.content && !row.platform
}

export function parseImportWorkbook(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('File Excel không có sheet nào.')
  }

  const worksheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  })

  const rows: ImportRow[] = []
  const errors: ImportRowError[] = []

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 2
    const row = mapWorksheetRow(rawRow)
    if (isRowEmpty(row)) return

    const title = row.title?.trim() ?? ''
    const content = row.content?.trim() ?? ''
    const platform = row.platform ? normalizePlatform(row.platform) : null

    if (!title) {
      errors.push({ rowNumber, message: 'Thiếu cột tieu_de (tiêu đề).' })
      return
    }
    if (!content) {
      errors.push({ rowNumber, message: 'Thiếu cột noi_dung (nội dung).' })
      return
    }
    if (!platform) {
      errors.push({
        rowNumber,
        message: 'Cột nen_tang không hợp lệ. Chỉ hỗ trợ: facebook, tiktok, instagram, youtube.',
      })
      return
    }

    const excerpt = row.excerpt?.trim() || extractExcerpt(content, 160)
    const slug = buildPostSlug(title, row.slug)
    const platformLabel = getPlatformLabel(platform)

    rows.push({
      rowNumber,
      title,
      content,
      platform,
      categorySlug: row.categorySlug?.trim() || undefined,
      tags: parseTags(row.tags),
      status: normalizeStatus(row.status),
      slug,
      excerpt,
      coverImageUrl: row.coverImageUrl?.trim() || undefined,
      metaTitle: buildSeoTitle(title, platformLabel),
      metaDescription: buildSeoDescription(content, excerpt, title),
    })
  })

  if (rows.length === 0 && errors.length === 0) {
    throw new Error('Không tìm thấy dòng dữ liệu hợp lệ trong file Excel.')
  }

  return { rows, errors }
}

export const IMPORT_TEMPLATE_HEADERS = [
  'tieu_de',
  'noi_dung',
  'nen_tang',
  'danh_muc',
  'tags',
  'trang_thai',
  'slug',
  'tom_tat',
  'anh_bia',
] as const

export const IMPORT_TEMPLATE_SAMPLE_ROWS = [
  {
    tieu_de: '5 cách tăng reach Facebook không cần chạy ads',
    noi_dung: `# 5 cách tăng reach Facebook

## 1. Đăng đúng khung giờ vàng
Theo dõi Insights để biết khi nào fan online nhiều nhất.

## 2. Dùng video ngắn dưới 60 giây
Video giữ chân người xem lâu hơn giúp thuật toán ưu tiên bài viết.

## 3. Kêu gọi tương tác tự nhiên
Đặt câu hỏi cuối bài để khuyến khích bình luận.`,
    nen_tang: 'facebook',
    danh_muc: '',
    tags: 'facebook,reach,tuong-tac',
    trang_thai: 'draft',
    slug: '',
    tom_tat: '',
    anh_bia: '',
  },
  {
    tieu_de: 'Cách lên xu hướng TikTok với video 15 giây',
    noi_dung: `# Cách lên xu hướng TikTok

- Mở video bằng câu hook mạnh trong 2 giây đầu
- Dùng nhạc trending phù hợp chủ đề
- Thêm phụ đề lớn, dễ đọc trên điện thoại
- Reply comment nhanh trong 30 phút đầu`,
    nen_tang: 'tiktok',
    danh_muc: '',
    tags: 'tiktok,xu-huong,viral',
    trang_thai: 'draft',
    slug: 'cach-len-xu-huong-tiktok-video-15-giay',
    tom_tat: 'Checklist ngắn giúp video TikTok dễ được đẩy lên For You.',
    anh_bia: '',
  },
] as const

export function buildImportTemplateWorkbook() {
  const worksheet = XLSX.utils.json_to_sheet(
    [...IMPORT_TEMPLATE_SAMPLE_ROWS],
    { header: [...IMPORT_TEMPLATE_HEADERS] }
  )
  worksheet['!cols'] = [
    { wch: 42 },
    { wch: 60 },
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
    { wch: 12 },
    { wch: 28 },
    { wch: 32 },
    { wch: 24 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BaiViet')
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}
