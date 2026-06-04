import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { setSessionCookie, verifyFilePassword, createFileSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    // ===== Supabase 模式 =====
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
      if (error) {
        return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
      }
      const cookie = setSessionCookie(data.session!.access_token)
      const res = NextResponse.json({ success: true, user: { id: data.user!.id, email: data.user!.email } })
      res.cookies.set(cookie.name, cookie.value, cookie.attributes)
      return res
    }

    // ===== 文件存储降级 =====
    const user = await verifyFilePassword(email, password)
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }
    const token = await createFileSession(user.id)
    const cookie = setSessionCookie(token)
    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email } })
    res.cookies.set(cookie.name, cookie.value, cookie.attributes)
    return res

  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}