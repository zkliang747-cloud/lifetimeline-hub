import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const PolishSchema = z.object({
  text: z.string().min(10).max(5000),
})

// 【P1 修复】速率限制存储（简易实现，生产环境应使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * 【P1 修复】实现速率限制
 * 防止 AI 接口被刷额度
 */
function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const body = await req.json()
    const { text } = PolishSchema.parse(body)

    // 【P1 修复】基于用户 ID 的速率限制
    // 限制每个用户每分钟最多 10 次请求
    const userRateLimit = `user:${user.id}`
    if (!checkRateLimit(userRateLimit, 10, 60000)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试（每分钟最多 10 次）' },
        { status: 429 }
      )
    }

    // 【P1 修复】基于 IP 的速率限制
    // 限制每个 IP 每分钟最多 100 次请求（防止 DDoS）
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const ipRateLimit = `ip:${clientIp}`
    if (!checkRateLimit(ipRateLimit, 100, 60000)) {
      return NextResponse.json(
        { error: '服务暂时不可用，请稍后再试' },
        { status: 429 }
      )
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
      return NextResponse.json(
        { error: `今日润色次数已达上限（${limit}次）` },
        { status: 429 }
      )
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
              content: '你是一位文字润色专家。请用优雅、温暖、有叙事感的中文改写以下文字，保留原意和关键信息，让表达更流畅优美。直接输出润色后的文字，不需要任何解释。',
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
    } catch (error) {
      console.error('DeepSeek API error:', error)
      return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求参数无效' },
        { status: 400 }
      )
    }
    console.error('Polish error:', error)
    return NextResponse.json({ error: '处理失败' }, { status: 500 })
  }
}
