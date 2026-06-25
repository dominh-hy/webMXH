'use client'

import { useState, useEffect, useCallback } from 'react'
import { PLATFORMS } from '@/types'
import type { Category } from '@/types'
import { slugify } from '@/lib/utils'
import {
  Plus, Pencil, Trash2, Loader2, FolderTree,
  Save, X, ChevronDown, GripVertical, Search
} from 'lucide-react'

const PLATFORM_OPTIONS = [
  { value: 'all', label: '🌐 Tất cả nền tảng' },
  ...PLATFORMS.map((p) => ({ value: p.value, label: `${p.emoji} ${p.label}` })),
]

const EMOJI_SUGGESTIONS = [
  '📌', '🔥', '💡', '⚡', '🎯', '🚀', '✅', '📊', '💰', '🎬',
  '📸', '🎵', '👥', '🔐', '📱', '🌟', '💬', '📈', '🛡️', '🎁',
  '🏆', '💎', '🔔', '📣', '🤝', '🧠', '⚙️', '🎨', '📝', '🔗',
]

type FormData = {
  name: string
  slug: string
  platform: string
  icon: string
  description: string
  sort_order: string
}

const emptyForm: FormData = {
  name: '', slug: '', platform: 'all', icon: '', description: '', sort_order: '',
}

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterPlatform, setFilterPlatform] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [editingId, setEditingId] = useState<string | null>(null) // null = new
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [formError, setFormError] = useState('')

  const loadCategories = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
    setShowEmojiPicker(false)
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      platform: cat.platform ?? 'all',
      icon: cat.icon ?? '',
      description: cat.description ?? '',
      sort_order: cat.sort_order != null ? String(cat.sort_order) : '',
    })
    setFormError('')
    setShowForm(true)
    setShowEmojiPicker(false)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
  }

  function handleNameChange(val: string) {
    setForm((f) => ({
      ...f,
      name: val,
      slug: editingId ? f.slug : slugify(val),
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('Vui lòng nhập tên danh mục.'); return }
    if (!form.slug.trim()) { setFormError('Vui lòng nhập slug.'); return }

    setSaving(true)
    setFormError('')

    const body = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name.trim(),
      slug: form.slug.trim(),
      platform: form.platform === 'all' ? 'all' : form.platform,
      icon: form.icon.trim() || null,
      description: form.description.trim() || null,
      sort_order: form.sort_order ? parseInt(form.sort_order) : null,
    }

    const res = await fetch('/api/admin/categories', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json()
      setFormError(err.error ?? 'Có lỗi xảy ra.')
    } else {
      closeForm()
      await loadCategories()
    }
    setSaving(false)
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Xóa danh mục "${cat.name}"? Thao tác này không thể hoàn tác.`)) return
    await fetch(`/api/admin/categories?id=${cat.id}`, { method: 'DELETE' })
    await loadCategories()
  }

  // Filter
  const filtered = categories.filter((c) => {
    const matchPlatform = !filterPlatform || c.platform === filterPlatform
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchPlatform && matchSearch
  })

  const platformLabel = (p: string | null) =>
    PLATFORM_OPTIONS.find((o) => o.value === (p ?? 'all'))?.label ?? p ?? '—'

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FolderTree size={22} style={{ color: 'var(--accent)' }} />
            Quản lý Danh mục
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {categories.length} danh mục
          </p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 py-2 px-5">
          <Plus size={16} />
          Thêm danh mục mới
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="input text-sm pl-9 w-full"
          />
        </div>
        {/* Platform filter */}
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="input text-sm w-auto min-w-48"
        >
          <option value="">Tất cả nền tảng</option>
          {PLATFORM_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Modal/Form overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fade-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button onClick={closeForm} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name & Icon row */}
              <div className="flex gap-3">
                {/* Icon picker */}
                <div className="flex-shrink-0">
                  <label className="label">Icon</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-16 h-10 rounded-xl text-2xl flex items-center justify-center border transition-colors hover:border-[var(--accent)]"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                    >
                      {form.icon || '➕'}
                    </button>
                    {showEmojiPicker && (
                      <div
                        className="absolute z-10 top-12 left-0 rounded-xl p-3 shadow-xl grid grid-cols-6 gap-1"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '240px' }}
                      >
                        {EMOJI_SUGGESTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => { setForm((f) => ({ ...f, icon: emoji })); setShowEmojiPicker(false) }}
                            className="text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setForm((f) => ({ ...f, icon: '' })); setShowEmojiPicker(false) }}
                          className="text-xs col-span-6 mt-1 text-center py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Xóa icon
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Name */}
                <div className="flex-1">
                  <label className="label">Tên danh mục *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="input text-sm"
                    placeholder="Bảo mật tài khoản"
                    autoFocus
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="label">Slug URL *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="input text-sm font-mono"
                  placeholder="bao-mat-tai-khoan"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="label">Nền tảng</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  className="input text-sm"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="label">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="input text-sm resize-none"
                  rows={2}
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>

              {/* Sort order */}
              <div>
                <label className="label">Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                  className="input text-sm"
                  placeholder="1, 2, 3... (để trống = cuối)"
                  min="0"
                />
              </div>

              {/* Error */}
              {formError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2">
                  {formError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={closeForm} className="flex-1 py-2 rounded-xl border font-semibold text-sm transition-colors"
                  style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {searchQuery || filterPlatform ? 'Không tìm thấy danh mục nào.' : 'Chưa có danh mục nào. Hãy tạo mới!'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Danh mục
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                  Nền tảng
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                  Slug
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>
                  Thứ tự
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr
                  key={cat.id}
                  className="transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">{cat.icon ?? '📁'}</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--accent)', border: '1px solid var(--border-color)' }}
                    >
                      {platformLabel(cat.platform)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <code className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {cat.sort_order ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-500"
                        style={{ color: 'var(--text-muted)' }}
                        title="Sửa"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
                        style={{ color: 'var(--text-muted)' }}
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
