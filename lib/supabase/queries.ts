import { createClient } from './server'
import type { Platform, Post, Category, Tag } from '@/types'

const PAGE_SIZE = 9

// ─── POSTS ─────────────────────────────────────────────────────────────────

export async function getPosts({
  platform,
  page = 1,
  pageSize = PAGE_SIZE,
  status = 'published',
}: {
  platform?: Platform
  page?: number
  pageSize?: number
  status?: 'published' | 'draft' | 'all'
} = {}) {
  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('posts')
    .select('*, category:categories(id,name,slug,platform,icon)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (platform) {
    query = query.eq('platform', platform)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Failed to load posts:', error.message)
    return {
      data: [],
      count: 0,
      page,
      pageSize,
      hasMore: false,
    }
  }

  return {
    data: data as Post[],
    count: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > to + 1,
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(id,name,slug,platform,icon)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) return null
  return data as Post
}

export async function getPostBySlugAdmin(slug: string): Promise<Post | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(id,name,slug,platform,icon)')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Post
}

export async function getRelatedPosts(postId: string, platform: Platform | null): Promise<Post[]> {
  const supabase = await createClient()

  // Fetch 2 posts of the same platform (excluding current post)
  let samePlatformQuery = supabase
    .from('posts')
    .select('id,title,slug,excerpt,platform,cover_image,views,created_at')
    .eq('status', 'published')
    .neq('id', postId)
    .order('created_at', { ascending: false })
    .limit(2)

  if (platform) {
    samePlatformQuery = samePlatformQuery.eq('platform', platform)
  }

  // Fetch 1 post of a different platform (excluding current post and current platform)
  let diffPlatformQuery = supabase
    .from('posts')
    .select('id,title,slug,excerpt,platform,cover_image,views,created_at')
    .eq('status', 'published')
    .neq('id', postId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (platform) {
    diffPlatformQuery = diffPlatformQuery.neq('platform', platform)
  }

  const [sameRes, diffRes] = await Promise.all([
    samePlatformQuery,
    diffPlatformQuery,
  ])

  const samePosts = (sameRes.data ?? []) as Post[]
  const diffPosts = (diffRes.data ?? []) as Post[]

  return [...samePosts, ...diffPosts]
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(id,name,slug,platform,icon)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Post
}

// ─── CATEGORIES ────────────────────────────────────────────────────────────

export async function getCategories(platform?: Platform): Promise<Category[]> {
  const supabase = await createClient()

  let query = supabase.from('categories').select('*').order('name')

  if (platform) {
    query = query.or(`platform.eq.${platform},platform.eq.all`)
  }

  const { data } = await query
  return (data ?? []) as Category[]
}

export async function getCategoryBySlug(platform: string, slug: string): Promise<Category | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('platform', platform)
    .eq('slug', slug)
    .single()

  return data as Category | null
}

// ─── TAGS ──────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('tags').select('*').order('name')
  return (data ?? []) as Tag[]
}

// ─── ALL SLUGS (for sitemap) ───────────────────────────────────────────────

export async function getAllPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('slug,updated_at')
    .eq('status', 'published')

  return data ?? []
}
