import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_KEY}`) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const { email, plan } = await req.json()
  if (!email || !plan) {
    return NextResponse.json({ error: '参数不足' }, { status: 400 })
  }

  // 通过 email 查找用户
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ plan })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: `${email} 已升级为 ${plan}` })
}