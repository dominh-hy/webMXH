import type { MetadataRoute } from 'next'
import { getAllPublishedSlugs, getCategories } from '@/lib/supabase/queries'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thuatmxh.vn'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories] = await Promise.all([
    getAllPublishedSlugs(),
    getCategories(),
  ])

  const postUrls: MetadataRoute.Sitemap = slugs.map(({ slug, updated_at }) => ({
    url: `${siteUrl}/bai-viet/${slug}`,
    lastModified: new Date(updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c) => c.platform && c.platform !== 'all')
    .map((c) => ({
      url: `${siteUrl}/danh-muc/${c.platform}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/tim-kiem`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...categoryUrls,
    ...postUrls,
  ]
}
