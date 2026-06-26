'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from 'lucide-react'

interface ImportResultItem {
  rowNumber: number
  title: string
  slug: string
  status: 'success' | 'error'
  message: string
  coverImage?: string | null
}

interface ImportResponse {
  totalRows: number
  successCount: number
  errorCount: number
  results: ImportResultItem[]
  error?: string
}

export default function PostImportForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [generateBanner, setGenerateBanner] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResponse | null>(null)

  function handleFileChange(selected: File | null) {
    setFile(selected)
    setError(null)
    setResult(null)
  }

  async function handleImport() {
    if (!file) {
      setError('Vui lòng chọn file Excel trước khi import.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('generateBanner', String(generateBanner))

      const response = await fetch('/api/admin/posts/import', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as ImportResponse
      if (!response.ok) {
        throw new Error(data.error ?? 'Import thất bại.')
      }

      setResult(data)
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Import thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Import bài viết từ Excel
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Tải file mẫu, điền dữ liệu theo các cột hướng dẫn, sau đó upload lại để tạo bài viết.
              Nếu cột <code className="text-xs">anh_bia</code> để trống, hệ thống sẽ tự tạo banner từ tiêu đề và nội dung.
            </p>
          </div>

          <a
            href="/templates/bai-viet-import-mau.xlsx"
            download="bai-viet-import-mau.xlsx"
            className="btn-primary whitespace-nowrap"
          >
            <Download size={16} />
            Tải file Excel mẫu
          </a>
        </div>

        <div className="mt-6 grid gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p><strong style={{ color: 'var(--text-primary)' }}>Cột bắt buộc:</strong> tieu_de, noi_dung, nen_tang</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>nen_tang:</strong> facebook, tiktok, instagram, youtube</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>trang_thai:</strong> draft hoặc published (mặc định draft)</p>
          <p><strong style={{ color: 'var(--text-primary)' }}>tags:</strong> phân tách bằng dấu phẩy</p>
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-colors hover:bg-[var(--bg-secondary)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <FileSpreadsheet size={36} className="mb-3" style={{ color: 'var(--accent)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {file ? file.name : 'Chọn file Excel (.xlsx)'}
          </span>
          <span className="mt-1 text-sm">Nhấn để chọn file hoặc thay file khác</span>
        </button>

        <label className="mt-5 flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={generateBanner}
            onChange={(event) => setGenerateBanner(event.target.checked)}
            className="mt-1"
          />
          <span>
            Tự động tạo ảnh banner khi cột <strong style={{ color: 'var(--text-primary)' }}>anh_bia</strong> để trống
          </span>
        </label>

        {error && (
          <div
            className="mt-5 flex items-start gap-3 rounded-xl p-4 text-sm"
            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !file}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {loading ? 'Đang import...' : 'Bắt đầu import'}
          </button>
          <Link href="/admin/bai-viet" className="btn-secondary">
            Quay lại danh sách
          </Link>
        </div>
      </div>

      {result && (
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Kết quả import</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Thành công: {result.successCount} / {result.totalRows} dòng
              </p>
            </div>
            {result.successCount > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
              >
                <CheckCircle2 size={14} />
                {result.successCount} bài đã tạo
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
            <div
              className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
            >
              <div className="col-span-1">Dòng</div>
              <div className="col-span-4">Tiêu đề</div>
              <div className="col-span-2">Slug</div>
              <div className="col-span-2">Trạng thái</div>
              <div className="col-span-3">Ghi chú</div>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {result.results.map((item) => (
                <div
                  key={`${item.rowNumber}-${item.slug}-${item.message}`}
                  className="grid grid-cols-12 gap-3 px-4 py-3 text-sm"
                >
                  <div className="col-span-1" style={{ color: 'var(--text-muted)' }}>{item.rowNumber}</div>
                  <div className="col-span-4 min-w-0 truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.title || '—'}
                  </div>
                  <div className="col-span-2 min-w-0 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {item.slug || '—'}
                  </div>
                  <div className="col-span-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: item.status === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: item.status === 'success' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {item.status === 'success' ? 'OK' : 'Lỗi'}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.message}
                    {item.coverImage && (
                      <>
                        {' '}
                        <a
                          href={item.coverImage}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold"
                          style={{ color: 'var(--accent)' }}
                        >
                          Xem banner
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
