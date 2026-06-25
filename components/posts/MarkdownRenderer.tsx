'use client'

import { useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import Image from 'next/image'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
}

function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return getNodeText((node as { props?: { children?: ReactNode } }).props?.children)
  }
  return ''
}

function createHeadingId(children: ReactNode) {
  return getNodeText(children)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

function MarkdownImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const normalizedSrc = src.startsWith('//')
    ? `https:${src}`
    : src.startsWith('http') || src.startsWith('/')
      ? src
      : `/${src.replace(/^\.?\//, '')}`

  return (
    <span className="relative my-6 block aspect-video w-full overflow-hidden rounded-xl">
      {!loaded && <span className="skeleton absolute inset-0" aria-hidden="true" />}
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 800px"
        onLoad={() => setLoaded(true)}
      />
    </span>
  )
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Lazy load images with next/image
          img: ({ src, alt }) => {
            if (!src) return null
            return <MarkdownImage src={String(src)} alt={alt ? String(alt) : ''} />
          },
          // Open external links in new tab
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            )
          },
          // Add IDs to headings for anchor links
          h2: ({ children, ...props }) => {
            const id = createHeadingId(children)
            return <h2 id={id} {...props}>{children}</h2>
          },
          h3: ({ children, ...props }) => {
            const id = createHeadingId(children)
            return <h3 id={id} {...props}>{children}</h3>
          },
          // Styled blockquotes (tip/warning)
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 pl-5 py-3 my-6 rounded-r-xl italic" style={{ borderColor: 'var(--accent)', background: 'var(--bg-secondary)' }}>
              {children}
            </blockquote>
          ),
          // Styled table
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
