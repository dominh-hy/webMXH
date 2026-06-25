'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  slug: string
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    fetch('/api/posts/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(console.error)
  }, [slug])

  return null
}
