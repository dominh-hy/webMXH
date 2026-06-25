'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { X, Loader2, ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Upload thất bại')

      onChange(data.url)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload thất bại. Vui lòng thử lại.'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled: uploading,
  })

  if (value) {
    return (
      <div className="relative group">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
          <Image
            src={value}
            alt="Cover image"
            fill
            className="object-cover"
            sizes="280px"
          />
        </div>
        <button
          onClick={() => onChange('')}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          title="Xoá ảnh"
        >
          <X size={14} />
        </button>
        <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
          {value.split('/').pop()}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
        style={{
          borderColor: isDragActive ? 'var(--accent)' : 'var(--border-color)',
          background: isDragActive ? 'rgba(14,144,224,0.05)' : 'var(--bg-secondary)',
        }}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
          ) : (
            <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
          )}
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {uploading ? 'Đang upload...' : isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để chọn ảnh'}
          </p>
          {!uploading && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              JPG, PNG, WebP, GIF — tối đa 10MB
            </p>
          )}
        </div>
      </div>

      {/* URL input */}
      <div className="mt-2">
        <input
          type="url"
          placeholder="Hoặc nhập URL ảnh..."
          className="input text-sm"
          onChange={(e) => { if (e.target.value) onChange(e.target.value) }}
        />
      </div>

      {error && (
        <p className="text-xs mt-1 text-red-500">{error}</p>
      )}
    </div>
  )
}
