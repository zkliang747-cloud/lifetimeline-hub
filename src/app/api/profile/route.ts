import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getProfile, updateProfile } from '@/lib/store'
import { z } from 'zod'

// 【P2 修复】用户资料字段限制
const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(50),
  bio: z.string().max(1000).optional().default(''),
  avatar_url: z.string().url().optional().nullable(),
})

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const profile = await getProfile(user.id)
  if (!profile) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const body = await req.json()
    
    // 【P2 修复】使用 Zod 验证字段长度
    const validated = UpdateProfileSchema.parse(body)

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          display_name: validated.display_name,
          bio: validated.bio,
          avatar_url: validated.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      await updateProfile(user.id, validated)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求参数无效', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Update profile error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
