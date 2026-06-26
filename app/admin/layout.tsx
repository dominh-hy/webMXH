import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

function AdminLayoutFallback() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      <div className="hidden w-60 shrink-0 animate-pulse sm:block" style={{ background: 'var(--bg-card)' }} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <div className="h-96 animate-pulse rounded-2xl" style={{ background: 'var(--bg-card)' }} />
        </div>
      </main>
    </div>
  )
}

function AdminPageFallback() {
  return (
    <div className="h-96 animate-pulse rounded-2xl" style={{ background: 'var(--bg-card)' }} />
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  )
}

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
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
      <Suspense fallback={<div className="hidden w-60 shrink-0 sm:block" style={{ background: 'var(--bg-card)' }} />}>
        <AdminSidebar user={user} />
      </Suspense>
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Suspense fallback={<AdminPageFallback />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  )
}
