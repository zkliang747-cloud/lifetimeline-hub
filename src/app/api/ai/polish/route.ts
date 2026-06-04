import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, getSessionUser } from '@/lib/auth';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: '文本太短，至少10个字符' }, { status: 400 });
    }

    // Check daily usage limit (free users: 3/day, sponsor: unlimited)
    if (user.plan === 'free') {
      const fs = await import('fs/promises');
      const USAGE_FILE = '/tmp/timeline-data/ai_usage.json';
      const today = new Date().toISOString().slice(0, 10);
      
      let usage: Record<string, Record<string, number>> = {};
      try {
        usage = JSON.parse(await fs.readFile(USAGE_FILE, 'utf-8'));
      } catch { /* ignore */ }
      
      if (!usage[today]) usage[today] = {};
      const currentCount = usage[today][user.id] || 0;
      
      if (currentCount >= 3) {
        return NextResponse.json({ error: '今日AI润色次数已达上限（免费用户每日3次）' }, { status: 429 });
      }
      
      usage[today][user.id] = currentCount + 1;
      await fs.mkdir('/tmp/timeline-data', { recursive: true });
      await fs.writeFile(USAGE_FILE, JSON.stringify(usage));
    }

    // Call DeepSeek API for text polishing
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位文字润色专家。请对用户提供的文本进行润色优化，使其更加通顺、优美、富有感染力。保持原意不变，只优化表达方式。直接返回润色后的文本，不要添加任何解释或前缀。',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const errData = await res.text();
      console.error('DeepSeek API error:', res.status, errData);
      return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 502 });
    }

    const data = await res.json();
    const polished = data.choices?.[0]?.message?.content;

    if (!polished) {
      return NextResponse.json({ error: 'AI 返回结果异常' }, { status: 502 });
    }

    return NextResponse.json({ polished });
  } catch (error) {
    console.error('AI polish error:', error);
    return NextResponse.json({ error: '润色失败，请稍后重试' }, { status: 500 });
  }
}