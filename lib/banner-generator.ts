import { uploadImage } from '@/lib/cloudinary'
import { extractExcerpt } from '@/lib/utils'
import { PLATFORM_MAP, type Platform } from '@/types'

const BANNER_WIDTH = 1200
const BANNER_HEIGHT = 630

const PLATFORM_GRADIENTS: Record<Platform, { from: string; to: string; accent: string }> = {
  facebook: { from: '#1877F2', to: '#0c5ec7', accent: '#ffffff' },
  tiktok: { from: '#111827', to: '#db2777', accent: '#ffffff' },
  instagram: { from: '#7c3aed', to: '#f97316', accent: '#ffffff' },
  youtube: { from: '#dc2626', to: '#991b1b', accent: '#ffffff' },
  zalo: { from: '#0068ff', to: '#06b6d4', accent: '#ffffff' },
  twitter: { from: '#111827', to: '#374151', accent: '#ffffff' },
  threads: { from: '#111827', to: '#52525b', accent: '#ffffff' },
  other: { from: '#475569', to: '#94a3b8', accent: '#ffffff' },
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= maxCharsPerLine) {
      current = next
      continue
    }

    if (current) lines.push(current)
    current = word
    if (lines.length >= maxLines) break
  }

  if (lines.length < maxLines && current) lines.push(current)
  return lines.slice(0, maxLines)
}

function buildBannerSvg({
  title,
  subtitle,
  platform,
}: {
  title: string
  subtitle: string
  platform: Platform
}) {
  const palette = PLATFORM_GRADIENTS[platform] ?? PLATFORM_GRADIENTS.other
  const platformInfo = PLATFORM_MAP[platform]
  const titleLines = wrapText(title, 28, 3)
  const subtitleLines = wrapText(subtitle, 52, 2)
  const titleStartY = titleLines.length === 1 ? 250 : titleLines.length === 2 ? 220 : 195

  const titleTspans = titleLines
    .map((line, index) =>
      `<tspan x="80" dy="${index === 0 ? 0 : 56}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const subtitleTspans = subtitleLines
    .map((line, index) =>
      `<tspan x="80" dy="${index === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${BANNER_WIDTH}" height="${BANNER_HEIGHT}" viewBox="0 0 ${BANNER_WIDTH} ${BANNER_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <circle cx="1080" cy="120" r="180" fill="#ffffff" fill-opacity="0.08" />
  <circle cx="150" cy="560" r="120" fill="#ffffff" fill-opacity="0.06" />
  <text x="80" y="88" fill="${palette.accent}" fill-opacity="0.92" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="2">
    THỦ THUẬT MXH
  </text>
  <text x="980" y="88" fill="${palette.accent}" fill-opacity="0.92" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">
    ${escapeXml(platformInfo?.emoji ?? '📱')}
  </text>
  <text x="80" y="${titleStartY}" fill="${palette.accent}" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" filter="url(#shadow)">
    ${titleTspans}
  </text>
  <text x="80" y="${titleStartY + titleLines.length * 56 + 36}" fill="${palette.accent}" fill-opacity="0.88" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="500">
    ${subtitleTspans}
  </text>
  <rect x="80" y="540" width="180" height="6" rx="3" fill="${palette.accent}" fill-opacity="0.85" />
  <text x="80" y="585" fill="${palette.accent}" fill-opacity="0.75" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600">
    ${escapeXml(platformInfo?.label ?? 'Mạng xã hội')}
  </text>
</svg>`
}

export async function generatePostBanner({
  title,
  content,
  excerpt,
  platform,
}: {
  title: string
  content: string
  excerpt?: string
  platform: Platform
}) {
  const subtitle = (excerpt?.trim() || extractExcerpt(content, 120)).trim()
  const svg = buildBannerSvg({ title, subtitle, platform })
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`
  const result = await uploadImage(dataUri, 'thuatmxh/banners')
  return result.secure_url
}
