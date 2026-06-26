import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildImportTemplateWorkbook } from '@/lib/excel-import'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const buffer = buildImportTemplateWorkbook()

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="bai-viet-import-mau.xlsx"',
      'Cache-Control': 'no-store',
    },
  })
}
