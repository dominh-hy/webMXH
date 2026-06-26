import { extractExcerpt, slugify } from '@/lib/utils'
import { PLATFORM_MAP, type Platform } from '@/types'

export function trimToLength(text: string, maxLength: number) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const sliced = clean.slice(0, maxLength - 1).trim()
  const lastSpace = sliced.lastIndexOf(' ')
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}...`
}

export function buildSeoTitle(title: string, platformLabel?: string) {
  const cleanTitle = title.replace(/\s+/g, ' ').trim()
  if (!cleanTitle) return ''
  const suffix = platformLabel ? ` | ${platformLabel}` : ' | MXH'
  if (`${cleanTitle}${suffix}`.length <= 60) return `${cleanTitle}${suffix}`
  return trimToLength(cleanTitle, 60)
}

export function buildSeoDescription(content: string, excerpt: string, title: string) {
  const source = excerpt || extractExcerpt(content, 220)
  const clean = source
    .replace(/^#+\s*/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (clean.length >= 120) return trimToLength(clean, 155)
  const prefix = title.trim() ? `${title.trim()}: ` : ''
  return trimToLength(`${prefix}${clean || extractExcerpt(content, 160)}`, 155)
}

const DB_PLATFORMS = new Set(['facebook', 'tiktok', 'instagram', 'youtube'])

const PLATFORM_ALIASES: Record<string, Platform> = {
  facebook: 'facebook',
  fb: 'facebook',
  tiktok: 'tiktok',
  instagram: 'instagram',
  ig: 'instagram',
  insta: 'instagram',
  youtube: 'youtube',
  yt: 'youtube',
}

export function normalizePlatform(value: string): Platform | null {
  const key = value.trim().toLowerCase()
  const mapped = PLATFORM_ALIASES[key]
  if (mapped && DB_PLATFORMS.has(mapped)) return mapped
  return null
}

export function buildPostSlug(title: string, customSlug?: string) {
  const slug = (customSlug?.trim() || slugify(title)).replace(/^-+|-+$/g, '')
  return slug || slugify(`bai-viet-${Date.now()}`)
}

export function parseTags(value: string | undefined): string[] {
  if (!value?.trim()) return []
  return [...new Set(
    value
      .split(/[,;|]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  )]
}

export function normalizeStatus(value: string | undefined): 'draft' | 'published' {
  const status = value?.trim().toLowerCase()
  if (status === 'published' || status === 'xuat-ban' || status === 'publish') return 'published'
  return 'draft'
}

export function getPlatformLabel(platform: Platform) {
  return PLATFORM_MAP[platform]?.label ?? platform
}
