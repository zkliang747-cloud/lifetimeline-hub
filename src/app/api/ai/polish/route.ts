import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, getSessionUser } from '@/lib/auth';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

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
      
      // Increment before call
      usage[today][user.id] = currentCount + 1;
      await fs.mkdir('/tmp/timeline-data', { recursive: true });
      await fs.writeFile(USAGE_FILE, JSON.stringify(usage));
    }

    // Call LLM for text polishing
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      {
        role: 'system' as const,
        content: '你是一位文字润色专家。请对用户提供的文本进行润色优化，使其更加通顺、优美、富有感染力。保持原意不变，只优化表达方式。直接返回润色后的文本，不要添加任何解释或前缀。',
      },
      {
        role: 'user' as const,
        content: text,
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    return NextResponse.json({ polished: response.content });
  } catch (error) {
    console.error('AI polish error:', error);
    return NextResponse.json({ error: '润色失败，请稍后重试' }, { status: 500 });
  }
}