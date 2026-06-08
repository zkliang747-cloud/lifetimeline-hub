import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { securityHeaders } from '@/lib/middleware'

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: '参数不足' }, { status: 400 })
    }

    if (supabaseAdmin) {
      // 【性能优化】只查询必要字段，减少数据传输
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id,display_name,bio,avatar_url,plan')
        .eq('username', username)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }

      // 【性能优化】只查询公开的时间轴条目必要字段
      const { data: entries } = await supabaseAdmin
        .from('timeline_entries')
        .select('id,year,title,content,tags,image_url,created_at')
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false })

      const response = NextResponse.json({
        profile,
        entries: entries || [],
      })

      return securityHeaders(response)
    }

    return NextResponse.json({ error: '数据库未配置' }, { status: 500 })
  } catch (error) {
    console.error('Public timeline error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}
