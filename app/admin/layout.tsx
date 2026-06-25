import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection()

  const headerStore = await headers()
  const pathname = headerStore.get('x-pathname')

  if (pathname === '/admin/login') {
    return children
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

