'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export default function AdminPostActions({ postId }: { postId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Bạn có chắc muốn xoá bài viết này?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', postId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
      style={{ color: '#dc2626' }}
      title="Xoá bài viết"
    >
      <Trash2 size={14} />
    </button>
  )
}
