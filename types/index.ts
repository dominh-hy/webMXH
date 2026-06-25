export type Platform = 'facebook' | 'tiktok' | 'instagram' | 'youtube' | 'zalo' | 'twitter' | 'threads' | 'other'

export type PostStatus = 'draft' | 'published'

export interface Post {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  platform: Platform | null
  category_id: string | null
  tags: string[]
  cover_image: string | null
  views: number
  status: PostStatus
  author_id: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  category?: Category | null
}

export interface Category {
  id: string
  name: string
  slug: string
  platform: Platform | 'all' | null
  icon: string | null
  description: string | null
  sort_order?: number | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  platform: Platform | null
  cover_image: string | null
  views: number
  created_at: string
  similarity_score: number
}

export interface PaginatedPosts {
  data: Post[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

export const PLATFORMS: { value: Platform; label: string; color: string; gradient: string; emoji: string }[] = [
  {
    value: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    gradient: 'from-blue-600 to-blue-400',
    emoji: '📘',
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    color: '#000000',
    gradient: 'from-gray-900 to-pink-500',
    emoji: '🎵',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    emoji: '📸',
  },
  {
    value: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    gradient: 'from-red-600 to-red-400',
    emoji: '▶️',
  },
  {
    value: 'zalo',
    label: 'Zalo',
    color: '#0068ff',
    gradient: 'from-blue-600 to-cyan-400',
    emoji: '🔵',
  },
  {
    value: 'twitter',
    label: 'Twitter/X',
    color: '#111827',
    gradient: 'from-gray-950 to-gray-600',
    emoji: 'X',
  },
  {
    value: 'threads',
    label: 'Threads',
    color: '#000000',
    gradient: 'from-gray-900 to-gray-500',
    emoji: '@',
  },
  {
    value: 'other',
    label: 'Khác',
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-400',
    emoji: '❓',
  },
]

export const PLATFORM_MAP: Record<Platform, { label: string; color: string; gradient: string; emoji: string }> = {
  facebook: { label: 'Facebook', color: '#1877F2', gradient: 'from-blue-600 to-blue-400', emoji: '📘' },
  tiktok: { label: 'TikTok', color: '#000000', gradient: 'from-gray-900 to-pink-500', emoji: '🎵' },
  instagram: { label: 'Instagram', color: '#E1306C', gradient: 'from-purple-600 via-pink-500 to-orange-400', emoji: '📸' },
  youtube: { label: 'YouTube', color: '#FF0000', gradient: 'from-red-600 to-red-400', emoji: '▶️' },
  zalo: { label: 'Zalo', color: '#0068ff', gradient: 'from-blue-600 to-cyan-400', emoji: '🔵' },
  twitter: { label: 'Twitter/X', color: '#111827', gradient: 'from-gray-950 to-gray-600', emoji: 'X' },
  threads: { label: 'Threads', color: '#000000', gradient: 'from-gray-900 to-gray-500', emoji: '@' },
  other: { label: 'Khác', color: '#64748b', gradient: 'from-slate-500 to-slate-400', emoji: '❓' },
}
