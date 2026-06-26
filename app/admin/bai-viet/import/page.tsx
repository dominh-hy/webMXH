import PostImportForm from '@/components/admin/PostImportForm'

export default function ImportPostsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          Import bài viết
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Upload file Excel để tạo hàng loạt bài viết và banner tự động
        </p>
      </div>

      <PostImportForm />
    </div>
  )
}
