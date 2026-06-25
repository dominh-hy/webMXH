'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/types'
import { slugify } from '@/lib/utils'
import { Plus, Trash2, Tag as TagIcon, Loader2 } from 'lucide-react'

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function loadTags() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('tags').select('*').order('name')
    setTags(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false
    if (!ignore) {
      loadTags()
    }
    return () => { ignore = true }
  }, [])

  async function addTag() {
    if (!newTagName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('tags').insert({
      name: newTagName.trim(),
      slug: slugify(newTagName.trim()),
    })
    if (!error) {
      setNewTagName('')
      await loadTags()
    }
    setSaving(false)
  }

  async function deleteTag(id: string) {
    if (!confirm('Xoá tag này?')) return
    const supabase = createClient()
    await supabase.from('tags').delete().eq('id', id)
    await loadTags()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Quản lý Tags</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{tags.length} tags</p>
      </div>

      {/* Add tag */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <h2 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>Thêm tag mới</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTag() }}
            placeholder="Tên tag..."
            className="input text-sm flex-1"
          />
          <button
            onClick={addTag}
            disabled={!newTagName.trim() || saving}
            className="btn-primary py-2 px-4 text-sm disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Thêm
          </button>
        </div>
        {newTagName && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Slug: <code className="font-mono">{slugify(newTagName)}</code>
          </p>
        )}
      </div>

      {/* Tags list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 p-5">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <TagIcon size={13} style={{ color: 'var(--accent)' }} />
                {tag.name}
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có tag nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
