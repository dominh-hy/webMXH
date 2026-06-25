import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getPostBySlug, getRelatedPosts } from '@/lib/supabase/queries'
import { PLATFORM_MAP } from '@/types'
import { formatDate, formatViews } from '@/lib/utils'
import Breadcrumb from '@/components/layout/Breadcrumb'
import MarkdownRenderer from '@/components/posts/MarkdownRenderer'
import PostCard from '@/components/posts/PostCard'
import ViewTracker from '@/components/posts/ViewTracker'
import NativeShareButton from '@/components/posts/NativeShareButton'
import FloatingTableOfContents, { type TocItem } from '@/components/posts/FloatingTableOfContents'
import { Eye, Clock, Tag } from 'lucide-react'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Không tìm thấy bài viết' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? '',
    openGraph: {
      title: post.meta_title ?? post.title,
      description: post.meta_description ?? post.excerpt ?? '',
      url: `${siteUrl}/bai-viet/${post.slug}`,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title ?? post.title,
      description: post.meta_description ?? post.excerpt ?? '',
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

// Schema.org HowTo JSON-LD
function HowToSchema({ post }: { post: Awaited<ReturnType<typeof getPostBySlug>> }) {
  if (!post) return null

  const steps = post.content
    ?.split('\n')
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: line.replace(/^#{2,3}\s/, ''),
      text: line.replace(/^#{2,3}\s/, ''),
    })) ?? []

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.excerpt,
    image: post.cover_image,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    step: steps,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function createHeadingId(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

function extractTableOfContents(content: string | null): TocItem[] {
  if (!content) return []

  return content
    .split('\n')
    .map((line) => {
      const match = /^(#{2,3})\s+(.+)$/.exec(line.trim())
      if (!match) return null

      const text = match[2].replace(/[*_`~]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
      if (!text) return null

      return {
        id: createHeadingId(text),
        text,
        level: match[1].length as 2 | 3,
      }
    })
    .filter((item): item is TocItem => Boolean(item))
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const related = await getRelatedPosts(post.id, post.platform)
  const platform = post.platform ? PLATFORM_MAP[post.platform] : null
  const tocItems = extractTableOfContents(post.content)

  const breadcrumbItems = [
    ...(post.platform ? [{ label: platform?.label ?? post.platform, href: `/?platform=${post.platform}` }] : []),
    ...(post.category ? [{ label: post.category.name, href: `/danh-muc/${post.platform}/${post.category.slug}` }] : []),
    { label: post.title },
  ]

  return (
    <>
      <HowToSchema post={post} />
      {/* Track view (client component) */}
      <ViewTracker slug={post.slug} />
      <FloatingTableOfContents items={tocItems} />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Cover Image */}
        {post.cover_image && (
          <div className="skeleton relative mb-6 aspect-video w-full overflow-hidden rounded-2xl shadow-2xl sm:mb-8">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-6 sm:mb-8">
          {/* Platform + Category */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            {platform && (
              <span className={`platform-badge badge-${post.platform}`}>
                {platform.label}
              </span>
            )}
            {post.category && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: platform ? `${platform.color}15` : 'var(--bg-secondary)',
                  color: platform?.color ?? 'var(--text-secondary)',
                  border: `1px solid ${platform ? `${platform.color}30` : 'var(--border-color)'}`,
                }}
              >
                {post.category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {post.excerpt}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center flex-wrap gap-3 text-sm sm:gap-4" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} />
              {formatViews(post.views)} lượt xem
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Tag size={14} style={{ color: 'var(--text-muted)' }} className="mt-0.5" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 rounded-full"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5">
            <NativeShareButton
              title={post.title}
              text={post.excerpt}
              url={`/bai-viet/${post.slug}`}
            />
          </div>
        </header>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--border-color)', marginBottom: '2rem' }} />

        {/* Markdown Content */}
        {post.content && (
          <article className="rounded-none px-0 sm:px-0">
            <MarkdownRenderer content={post.content} />
          </article>
        )}

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              📌 Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
