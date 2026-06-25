'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Post, Category, Tag } from '@/types'
import { PLATFORMS } from '@/types'
import { slugify, extractExcerpt } from '@/lib/utils'
import ImageUpload from './ImageUpload'
import MarkdownRenderer from '@/components/posts/MarkdownRenderer'
import {
  Save, Eye, Loader2, AlertCircle, CheckCircle2,
  LayoutPanelLeft, AlignLeft, Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, ListChecks,
  Link2, ImageIcon, Table, Quote, Code, CodeSquare,
  Minus, CornerDownLeft, Undo2, Redo2, Maximize2, Minimize2,
  Type, Clock, FileText,
} from 'lucide-react'

interface PostEditorProps {
  post?: Post
  categories: Category[]
  tags: Tag[]
}

type ViewMode = 'split' | 'editor' | 'preview'

function trimToLength(text: string, maxLength: number) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const sliced = clean.slice(0, maxLength - 1).trim()
  const lastSpace = sliced.lastIndexOf(' ')
  return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}...`
}

function buildSeoTitle(title: string, platformLabel?: string) {
  const cleanTitle = title.replace(/\s+/g, ' ').trim()
  if (!cleanTitle) return ''
  const suffix = platformLabel ? ` | ${platformLabel}` : ' | MXH'
  if (`${cleanTitle}${suffix}`.length <= 60) return `${cleanTitle}${suffix}`
  return trimToLength(cleanTitle, 60)
}

function buildSeoDescription(content: string, excerpt: string, title: string) {
  const source = excerpt || extractExcerpt(content, 220)
  const clean = source
    .replace(/^#+\s*/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (clean.length >= 120) return trimToLength(clean, 155)
  const prefix = title.trim() ? `${title.trim()}: ` : ''
  return trimToLength(`${prefix}${clean || extractExcerpt(content, 160)}`, 155)
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function estimateReadTime(text: string) {
  const words = countWords(text)
  const minutes = Math.ceil(words / 200)
  return minutes < 1 ? '< 1 phút' : `${minutes} phút`
}

// ─── Toolbar Button ─────────────────────────────────────────────────────────
function ToolbarBtn({
  icon: Icon, title, onClick, active, disabled
}: {
  icon: React.ElementType
  title: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-xs font-bold select-none disabled:opacity-40"
      style={{
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? 'white' : 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)'
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      <Icon size={14} />
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: 'var(--border-color)' }} />
}

// ─── Insert helpers ──────────────────────────────────────────────────────────
function wrap(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = before,
  placeholder = 'text'
): string {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.slice(start, end)
  const text = selected || placeholder
  const newValue =
    textarea.value.slice(0, start) +
    before + text + after +
    textarea.value.slice(end)

  const cursorStart = start + before.length
  const cursorEnd = cursorStart + text.length
  return newValue + '\n__CURSOR__' + cursorStart + ':' + cursorEnd
}

function insertLine(
  textarea: HTMLTextAreaElement,
  prefix: string,
  placeholder = 'nội dung'
): string {
  const start = textarea.selectionStart
  const val = textarea.value
  // Go to beginning of line
  const lineStart = val.lastIndexOf('\n', start - 1) + 1
  const lineEnd = val.indexOf('\n', start)
  const endPos = lineEnd === -1 ? val.length : lineEnd
  const lineContent = val.slice(lineStart, endPos).trim()
  const newLine = prefix + (lineContent || placeholder)
  const newValue = val.slice(0, lineStart) + newLine + val.slice(endPos)
  return newValue + '\n__CURSOR__' + (lineStart + newLine.length) + ':' + (lineStart + newLine.length)
}

function insertAtCursor(textarea: HTMLTextAreaElement, snippet: string): string {
  const start = textarea.selectionStart
  const val = textarea.value
  const newValue = val.slice(0, start) + snippet + val.slice(start)
  const cursor = start + snippet.length
  return newValue + '\n__CURSOR__' + cursor + ':' + cursor
}

// ─── Undo/Redo simple stack ──────────────────────────────────────────────────
function useUndoRedo(initial: string) {
  const historyRef = useRef<string[]>([initial])
  const indexRef = useRef(0)

  function push(val: string) {
    const history = historyRef.current.slice(0, indexRef.current + 1)
    history.push(val)
    historyRef.current = history.slice(-100)
    indexRef.current = historyRef.current.length - 1
  }

  function undo() {
    if (indexRef.current > 0) {
      indexRef.current--
      return historyRef.current[indexRef.current]
    }
    return null
  }

  function redo() {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++
      return historyRef.current[indexRef.current]
    }
    return null
  }

  const canUndo = () => indexRef.current > 0
  const canRedo = () => indexRef.current < historyRef.current.length - 1

  return { push, undo, redo, canUndo, canRedo }
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export default function PostEditor({ post, categories }: PostEditorProps) {
  const router = useRouter()
  const isEdit = !!post
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const undoRedo = useUndoRedo(post?.content ?? '')

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [platform, setPlatform] = useState(post?.platform ?? '')
  const [categoryId, setCategoryId] = useState(post?.category_id ?? '')
  const [tagInput, setTagInput] = useState(post?.tags?.join(', ') ?? '')
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft')
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? '')

  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
    if (!metaTitle) {
      const platformLabel = PLATFORMS.find((p) => p.value === platform)?.label
      setMetaTitle(buildSeoTitle(val, platformLabel))
    }
  }, [isEdit, metaTitle, platform])

  const handleContentChange = useCallback((val: string) => {
    setContent(val)
    undoRedo.push(val)
    if (!excerpt) setExcerpt(extractExcerpt(val))
    if (!metaDescription) setMetaDescription(buildSeoDescription(val, excerpt, title))
  }, [excerpt, metaDescription, title, undoRedo])

  // Apply toolbar action and update textarea
  function applyTransform(result: string) {
    const cursorMatch = result.match(/\n__CURSOR__(\d+):(\d+)$/)
    const newValue = result.replace(/\n__CURSOR__\d+:\d+$/, '')
    setContent(newValue)
    undoRedo.push(newValue)
    if (!excerpt) setExcerpt(extractExcerpt(newValue))
    if (!metaDescription) setMetaDescription(buildSeoDescription(newValue, excerpt, title))

    // Restore cursor after React re-render
    if (cursorMatch && textareaRef.current) {
      const sel = [parseInt(cursorMatch[1]), parseInt(cursorMatch[2])]
      setTimeout(() => {
        textareaRef.current!.focus()
        textareaRef.current!.setSelectionRange(sel[0], sel[1])
      }, 0)
    }
  }

  function ta() { return textareaRef.current! }

  const toolbar = {
    bold: () => applyTransform(wrap(ta(), '**')),
    italic: () => applyTransform(wrap(ta(), '*')),
    strike: () => applyTransform(wrap(ta(), '~~')),
    inlineCode: () => applyTransform(wrap(ta(), '`')),
    h1: () => applyTransform(insertLine(ta(), '# ')),
    h2: () => applyTransform(insertLine(ta(), '## ')),
    h3: () => applyTransform(insertLine(ta(), '### ')),
    ul: () => applyTransform(insertLine(ta(), '- ')),
    ol: () => applyTransform(insertLine(ta(), '1. ')),
    check: () => applyTransform(insertLine(ta(), '- [ ] ')),
    quote: () => applyTransform(insertLine(ta(), '> ')),
    hr: () => applyTransform(insertAtCursor(ta(), '\n---\n')),
    link: () => {
      const sel = ta().value.slice(ta().selectionStart, ta().selectionEnd)
      applyTransform(insertAtCursor(ta(), `[${sel || 'tiêu đề link'}](https://)`))
    },
    image: () => applyTransform(insertAtCursor(ta(), `![mô tả ảnh](https://)`)),
    table: () => applyTransform(insertAtCursor(ta(),
      '\n| Cột 1 | Cột 2 | Cột 3 |\n|-------|-------|-------|\n| Dữ liệu | Dữ liệu | Dữ liệu |\n'
    )),
    codeBlock: () => applyTransform(wrap(ta(), '\n```\n', '\n```\n', 'code here')),
    undo: () => {
      const prev = undoRedo.undo()
      if (prev !== null) setContent(prev)
    },
    redo: () => {
      const next = undoRedo.redo()
      if (next !== null) setContent(next)
    },
  }

  async function handleSave(saveStatus?: 'draft' | 'published') {
    if (!title.trim()) { setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài viết.' }); return }
    if (!slug.trim()) { setMessage({ type: 'error', text: 'Vui lòng nhập slug.' }); return }
    if (!platform) { setMessage({ type: 'error', text: 'Vui lòng chọn nền tảng trước khi lưu.' }); return }
    if (!content.trim()) { setMessage({ type: 'error', text: 'Vui lòng nhập nội dung bài viết.' }); return }

    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean)
    const platformLabel = PLATFORMS.find((p) => p.value === platform)?.label
    const generatedExcerpt = excerpt || extractExcerpt(content)
    const generatedMetaTitle = metaTitle || buildSeoTitle(title, platformLabel)
    const generatedMetaDescription = metaDescription || buildSeoDescription(content, generatedExcerpt, title)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: generatedExcerpt,
      platform,
      category_id: categoryId || null,
      tags,
      cover_image: coverImage || null,
      status: saveStatus ?? status,
      meta_title: trimToLength(generatedMetaTitle, 60),
      meta_description: trimToLength(generatedMetaDescription, 155),
    }

    try {
      if (isEdit && post) {
        const { error } = await supabase.from('posts').update(payload).eq('id', post.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('posts').insert(payload)
        if (error) throw error
      }
      setMessage({ type: 'success', text: isEdit ? 'Đã lưu thành công!' : 'Đã tạo bài viết thành công!' })
      if (!isEdit) setTimeout(() => router.push('/admin/bai-viet'), 1000)
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi xảy ra.' })
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = categories.filter(
    (c) => !platform || c.platform === platform || c.platform === 'all'
  )

  const wordCount = countWords(content)
  const charCount = content.length
  const readTime = estimateReadTime(content)

  return (
    <div
      className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-4rem)]'}`}
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Tiêu đề bài viết..."
          className="text-xl font-bold bg-transparent outline-none flex-1 min-w-0 mr-4"
          style={{ color: 'var(--text-primary)' }}
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View mode toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--border-color)' }}>
            {(['editor', 'split', 'preview'] as ViewMode[]).map((mode) => {
              const icons = { editor: <AlignLeft size={14} />, split: <LayoutPanelLeft size={14} />, preview: <Eye size={14} /> }
              const labels = { editor: 'Editor', split: 'Split', preview: 'Preview' }
              return (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: viewMode === mode ? 'var(--accent)' : 'transparent', color: viewMode === mode ? 'white' : 'var(--text-muted)' }}
                  title={labels[mode]}
                >
                  {icons[mode]}
                  <span className="hidden sm:inline">{labels[mode]}</span>
                </button>
              )
            })}
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
            title={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="input py-1.5 px-3 text-sm"
            style={{ width: 'auto' }}
          >
            <option value="draft">Nháp</option>
            <option value="published">Xuất bản</option>
          </select>

          {/* Save */}
          <button onClick={() => handleSave()} disabled={saving} className="btn-primary py-1.5 px-4 text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Đang lưu...' : (isEdit ? 'Lưu' : 'Tạo bài')}
          </button>
        </div>
      </div>

      {/* ── Message ─────────────────────────────────────────────────── */}
      {message && (
        <div
          className="mx-4 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm animate-fade-in flex-shrink-0"
          style={{
            background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden mt-3 gap-4 px-4 pb-4 min-h-0">

        {/* ── Left: Settings panel ─── */}
        <div
          className="w-72 flex-shrink-0 overflow-y-auto rounded-2xl p-4 space-y-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {/* Slug */}
          <div>
            <label className="label">Slug URL</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="input text-sm font-mono" placeholder="bai-viet-cua-toi" />
          </div>

          {/* Platform */}
          <div>
            <label className="label">Nền tảng</label>
            <select value={platform} onChange={(e) => {
              setPlatform(e.target.value)
              if (!metaTitle && title) {
                const lbl = PLATFORMS.find((p) => p.value === e.target.value)?.label
                setMetaTitle(buildSeoTitle(title, lbl))
              }
            }} className="input text-sm" required>
              <option value="">-- Chọn nền tảng --</option>
              {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.emoji} {p.label}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="label">Danh mục</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input text-sm">
              <option value="">-- Chọn danh mục --</option>
              {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags (cách nhau bởi dấu phẩy)</label>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} className="input text-sm" placeholder="facebook, tăng-follower, viral" />
          </div>

          {/* Cover Image */}
          <div>
            <label className="label">Ảnh bìa</label>
            <ImageUpload value={coverImage} onChange={setCoverImage} />
          </div>

          {/* Excerpt */}
          <div>
            <label className="label">Tóm tắt</label>
            <textarea value={excerpt} onChange={(e) => {
              setExcerpt(e.target.value)
              if (!metaDescription) setMetaDescription(buildSeoDescription(content, e.target.value, title))
            }} className="input text-sm resize-none" rows={3} placeholder="Mô tả ngắn về bài viết..." />
          </div>

          {/* SEO */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>SEO</p>
            <div className="space-y-3">
              <div>
                <label className="label">Meta Title</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="input text-sm"
                  placeholder={buildSeoTitle(title, PLATFORMS.find((p) => p.value === platform)?.label) || 'Meta title...'} />
                <p className="text-xs mt-1" style={{ color: metaTitle.length > 60 ? '#ef4444' : 'var(--text-muted)' }}>
                  {metaTitle.length}/60 ký tự
                </p>
              </div>
              <div>
                <label className="label">Meta Description</label>
                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="input text-sm resize-none" rows={3}
                  placeholder={buildSeoDescription(content, excerpt, title) || 'Meta description...'} />
                <p className="text-xs mt-1" style={{ color: metaDescription.length > 160 ? '#ef4444' : 'var(--text-muted)' }}>
                  {metaDescription.length}/160 ký tự
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: Editor ─── */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            {/* ── Rich Toolbar ── */}
            <div
              className="flex items-center flex-wrap gap-0.5 px-3 py-2 flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
            >
              {/* Heading group */}
              <ToolbarBtn icon={Heading1} title="Tiêu đề 1 (H1)" onClick={toolbar.h1} />
              <ToolbarBtn icon={Heading2} title="Tiêu đề 2 (H2)" onClick={toolbar.h2} />
              <ToolbarBtn icon={Heading3} title="Tiêu đề 3 (H3)" onClick={toolbar.h3} />

              <ToolbarDivider />

              {/* Format group */}
              <ToolbarBtn icon={Bold} title="In đậm (Ctrl+B)" onClick={toolbar.bold} />
              <ToolbarBtn icon={Italic} title="In nghiêng (Ctrl+I)" onClick={toolbar.italic} />
              <ToolbarBtn icon={Strikethrough} title="Gạch ngang" onClick={toolbar.strike} />
              <ToolbarBtn icon={Code} title="Inline code" onClick={toolbar.inlineCode} />

              <ToolbarDivider />

              {/* List group */}
              <ToolbarBtn icon={List} title="Danh sách gạch đầu dòng" onClick={toolbar.ul} />
              <ToolbarBtn icon={ListOrdered} title="Danh sách số thứ tự" onClick={toolbar.ol} />
              <ToolbarBtn icon={ListChecks} title="Danh sách checkbox" onClick={toolbar.check} />

              <ToolbarDivider />

              {/* Insert group */}
              <ToolbarBtn icon={Quote} title="Trích dẫn (Blockquote)" onClick={toolbar.quote} />
              <ToolbarBtn icon={Link2} title="Chèn link" onClick={toolbar.link} />
              <ToolbarBtn icon={ImageIcon} title="Chèn ảnh (URL)" onClick={toolbar.image} />
              <ToolbarBtn icon={Table} title="Chèn bảng" onClick={toolbar.table} />
              <ToolbarBtn icon={CodeSquare} title="Khối code" onClick={toolbar.codeBlock} />
              <ToolbarBtn icon={Minus} title="Đường kẻ ngang" onClick={toolbar.hr} />

              <ToolbarDivider />

              {/* Undo / Redo */}
              <ToolbarBtn icon={Undo2} title="Hoàn tác (Ctrl+Z)" onClick={toolbar.undo} />
              <ToolbarBtn icon={Redo2} title="Làm lại (Ctrl+Y)" onClick={toolbar.redo} />
            </div>

            {/* ── Textarea ── */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'b') { e.preventDefault(); toolbar.bold() }
                  if (e.key === 'i') { e.preventDefault(); toolbar.italic() }
                  if (e.key === 'z') { e.preventDefault(); toolbar.undo() }
                  if (e.key === 'y') { e.preventDefault(); toolbar.redo() }
                }
                // Auto-indent list items
                if (e.key === 'Enter') {
                  const ta = textareaRef.current!
                  const start = ta.selectionStart
                  const currentLine = ta.value.lastIndexOf('\n', start - 1)
                  const line = ta.value.slice(currentLine + 1, start)
                  const listMatch = line.match(/^(\s*)([-*+]|\d+\.|\- \[[ x]\])\s/)
                  if (listMatch) {
                    e.preventDefault()
                    const prefix = listMatch[0]
                    const newVal = ta.value.slice(0, start) + '\n' + prefix + ta.value.slice(start)
                    setContent(newVal)
                    setTimeout(() => {
                      ta.setSelectionRange(start + 1 + prefix.length, start + 1 + prefix.length)
                    }, 0)
                  }
                }
              }}
              className="flex-1 p-5 text-sm font-mono outline-none resize-none"
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', lineHeight: '1.8', tabSize: 2 }}
              placeholder="# Tiêu đề bài viết

## Giới thiệu

Viết nội dung ở đây... Sử dụng toolbar phía trên hoặc Markdown trực tiếp.

## Bước 1: ...

## Bước 2: ...
"
              spellCheck={false}
            />

            {/* ── Status bar ── */}
            <div
              className="flex items-center gap-4 px-4 py-1.5 text-xs flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-1">
                <Type size={11} />
                {wordCount.toLocaleString()} từ
              </span>
              <span className="flex items-center gap-1">
                <FileText size={11} />
                {charCount.toLocaleString()} ký tự
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                ~{readTime} đọc
              </span>
              <span className="ml-auto">Markdown</span>
            </div>
          </div>
        )}

        {/* ── Right: Preview ─── */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            <div
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wide flex items-center gap-2 flex-shrink-0"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}
            >
              <Eye size={12} /> Live Preview
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <p className="text-4xl mb-2">✍️</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bắt đầu viết để xem preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
