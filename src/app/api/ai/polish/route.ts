import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { text } = await req.json()
  if (!text || text.length < 10) {
    return NextResponse.json({ error: '正文至少10个字符' }, { status: 400 })
  }

  // 检查每日使用次数
  const today = new Date().toISOString().slice(0, 10)
  const { data: usage } = await supabaseAdmin
    .from('ai_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  // 先查用户权益
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'sponsor' || profile?.plan === 'pro'
  const limit = isPro ? 999 : 3
  const currentCount = usage?.count || 0

  if (currentCount >= limit) {
    return NextResponse.json({ error: '今日润色次数已达上限' }, { status: 429 })
  }

  // 调用 DeepSeek API
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 })
  }

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位文字润色专家。请用优雅、温暖、有叙事感的中文改写以下文字，保留原意和关键信息，让表达更流畅优美。直接输出润色结果，不要加任何前缀后缀。',
          },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const data = await resp.json()
    const polished = data.choices?.[0]?.message?.content

    if (!polished) {
      return NextResponse.json({ error: 'AI 服务响应异常' }, { status: 500 })
    }

    // 更新使用次数
    if (usage) {
      await supabaseAdmin
        .from('ai_usage')
        .update({ count: currentCount + 1 })
        .eq('user_id', user.id)
        .eq('date', today)
    } else {
      await supabaseAdmin
        .from('ai_usage')
        .insert({ user_id: user.id, date: today, count: 1 })
    }

    return NextResponse.json({ polished })
  } catch {
    return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 500 })
  }
}