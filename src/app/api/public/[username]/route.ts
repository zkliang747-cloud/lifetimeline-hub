import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const { data: entries } = await supabaseAdmin
    .from('timeline_entries')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('year', { ascending: true })

  return NextResponse.json({ profile, entries: entries || [] })
}