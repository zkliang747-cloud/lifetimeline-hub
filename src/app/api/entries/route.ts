import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getEntries, createEntry } from '@/lib/store'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('timeline_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  // File fallback
  const entries = getEntries(user.id)
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json()
  const { year, title, content, tags, is_public, image_url } = body

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('timeline_entries')
      .insert([{ user_id: user.id, year: parseInt(year), title, content: content || '', tags: tags || [], is_public: is_public ?? true, image_url: image_url || '' }])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  // File fallback
  const entry = await createEntry(user.id, { year: parseInt(year), title, content: content || '', tags: tags || [], is_public: is_public ?? true, image_url: image_url || '' })
  return NextResponse.json(entry, { status: 201 })
}