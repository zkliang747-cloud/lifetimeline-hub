import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin key
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_KEY}`) {
      // Fallback: check if ADMIN_KEY is empty or use a default for dev
      const adminKey = process.env.ADMIN_KEY || 'dev-admin-key';
      if (authHeader !== `Bearer ${adminKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { email, plan } = await request.json();
    if (!email || !plan) {
      return NextResponse.json({ error: '邮箱和权益类型不能为空' }, { status: 400 });
    }

    if (!['free', 'sponsor'].includes(plan)) {
      return NextResponse.json({ error: '无效的权益类型' }, { status: 400 });
    }

    const { updateUserPlan } = await import('@/lib/auth');
    const success = await updateUserPlan(email, plan as 'free' | 'sponsor');
    
    if (!success) {
      return NextResponse.json({ error: '未找到该邮箱的用户' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `用户 ${email} 已升级为 ${plan === 'sponsor' ? '赞助版' : '免费版'}` });
  } catch (error) {
    console.error('Sponsor admin error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}