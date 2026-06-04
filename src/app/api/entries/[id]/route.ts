import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await params

  // 验证所有权
  const { data: existing } = await supabaseAdmin
    .from('timeline_entries')
    .select('user_id')
    .eq('id', id)
    .single()
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  const body = await req.json()
  const { year, title, content, tags, is_public, image_url } = body

  const { error } = await supabaseAdmin
    .from('timeline_entries')
    .update({
      year: parseInt(year),
      title,
      content: content || '',
      tags: tags || [],
      is_public: is_public ?? true,
      image_url: image_url || '',
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await params

  const { data: existing } = await supabaseAdmin
    .from('timeline_entries')
    .select('user_id')
    .eq('id', id)
    .single()
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from('timeline_entries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}