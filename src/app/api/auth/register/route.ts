import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { setSessionCookie, createFileUser, createFileSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: '所有字段都是必填的' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: '用户名限3-20位字母数字下划线' }, { status: 400 })
    }

    // ===== 使用 Supabase（部署环境） =====
    if (supabaseAdmin) {
      // 检查用户名是否已存在
      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()
      if (existing) {
        return NextResponse.json({ error: '用户名已被占用' }, { status: 409 })
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email, password,
        email_confirm: true,
        user_metadata: { username },
      })
      if (error) {
        if (error.message.includes('already registered')) {
          return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const { data: sessionData } = await supabaseAdmin.auth.signInWithPassword({ email, password })
      const cookie = setSessionCookie(sessionData!.session!.access_token)
      const res = NextResponse.json({
        success: true,
        user: { id: data.user!.id, username, email: data.user!.email },
      })
      res.cookies.set(cookie.name, cookie.value, cookie.attributes)
      return res
    }

    // ===== 降级：文件存储（沙箱预览） =====
    const result = await createFileUser(username, email, password)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }
    const token = await createFileSession(result.user!.id)
    const cookie = setSessionCookie(token)
    const res = NextResponse.json({ success: true, user: result.user })
    res.cookies.set(cookie.name, cookie.value, cookie.attributes)
    return res

  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}