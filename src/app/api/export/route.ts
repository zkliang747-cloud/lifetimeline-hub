import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { data: entries } = await supabaseAdmin
    .from('timeline_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('year', { ascending: true })

  const json = JSON.stringify(entries || [], null, 2)
  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="timeline-export.json"',
    },
  })
}