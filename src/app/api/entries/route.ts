import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getEntries, createEntry } from '@/lib/store'
import { z } from 'zod'

// 【P2 修复】Zod 字段校验
const CreateEntrySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  title: z.string().min(1).max(200),
  content: z.string().max(10000).optional().default(''),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  is_public: z.boolean().optional().default(true),
  image_url: z.string().url().optional().nullable(),
})

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  if (supabaseAdmin) {
    // 【性能优化】只查询必要字段，减少网络流量
    const { data, error } = await supabaseAdmin
      .from('timeline_entries')
      .select('id,user_id,year,title,content,tags,is_public,image_url,created_at,updated_at')
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

  try {
    const body = await req.json()
    
    // 【P2 修复】使用 Zod 进行统一字段校验
    const validated = CreateEntrySchema.parse(body)

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('timeline_entries')
        .insert([{ 
          user_id: user.id, 
          year: validated.year, 
          title: validated.title, 
          content: validated.content, 
          tags: validated.tags, 
          is_public: validated.is_public, 
          image_url: validated.image_url || null 
        }])
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    // File fallback
    const entry = await createEntry(user.id, validated)
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求参数无效', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create entry error:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
