import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/types'
import { PLATFORM_MAP } from '@/types'
import { formatRelativeDate, formatViews, truncate } from '@/lib/utils'
import { Eye, Clock, ArrowUpRight } from 'lucide-react'

interface PostCardProps {
  post: Post
  index?: number
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const platform = post.platform ? PLATFORM_MAP[post.platform] : null

  return (
    <Link
      href={`/bai-viet/${post.slug}`}
      className="card group flex flex-col h-full"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Cover Image */}
      <div className="skeleton relative aspect-video overflow-hidden">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${platform?.gradient ?? 'from-slate-400 to-slate-600'} flex items-center justify-center`}
          >
            <span className="text-xl font-bold opacity-80 text-white">{platform?.label ?? 'MXH'}</span>
          </div>
        )}

        {/* Platform badge overlay */}
        {platform && (
          <div className="absolute top-3 left-3">
            <span className={`platform-badge badge-${post.platform}`}>
              {platform.label}
            </span>
          </div>
        )}

        {/* Arrow icon on hover */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Category */}
        {post.category && (
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: platform?.color ?? 'var(--accent)' }}
          >
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h2
          className="font-bold text-base leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm leading-relaxed line-clamp-2 flex-1" style={{ color: 'var(--text-secondary)' }}>
            {truncate(post.excerpt, 120)}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div
          className="flex items-center justify-between text-xs pt-2"
          style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}
        >
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatRelativeDate(post.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {formatViews(post.views)}
          </span>
        </div>
      </div>
    </Link>
  )
}
