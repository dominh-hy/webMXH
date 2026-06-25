'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

interface NativeShareButtonProps {
  title: string
  text?: string | null
  url: string
}

export default function NativeShareButton({ title, text, url }: NativeShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const shareUrl = useMemo(() => {
    if (url.startsWith('http')) return url
    if (typeof window === 'undefined') return url
    return new URL(url, window.location.origin).toString()
  }, [url])

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && Boolean(navigator.share))
  }, [])

  async function handleShare() {
    try {
      if (canNativeShare) {
        await navigator.share({
          title,
          text: text ?? title,
          url: shareUrl,
        })
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors"
      style={{
        background: 'var(--bg-secondary)',
        color: copied ? 'var(--accent)' : 'var(--text-primary)',
        border: '1px solid var(--border-color)',
      }}
      aria-label="Chia se bai viet"
    >
      {copied ? <Check size={18} /> : canNativeShare ? <Share2 size={18} /> : <Copy size={18} />}
      <span>{copied ? 'Da copy' : 'Chia se'}</span>
    </button>
  )
}
