import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getProfile } from '@/lib/store';

// 操作消耗的积分明细
export const CREDIT_COSTS = {
  AI_POLISH: 3,
  PDF_EXPORT: 5,
  POSTER_EXPORT: 2,
  IMAGE_STORAGE: 0,
};

// 获取用户积分余额
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const profile = await getProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      credits: profile.credits || 0,
      plan: profile.plan || 'free',
    });
  } catch (error) {
    console.error('Get credits error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

// 扣费并记录
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { action, amount } = await req.json();

    if (!action || !amount) {
      return NextResponse.json(
        { error: '缺少参数' },
        { status: 400 }
      );
    }

    const profile = await getProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const currentCredits = profile.credits || 0;
    if (currentCredits < amount) {
      return NextResponse.json(
        { error: '积分不足，请充值后再试' },
        { status: 400 }
      );
    }

    const newCredits = currentCredits - amount;
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    await supabaseAdmin
      .from('credit_logs')
      .insert([{
        user_id: userId,
        action,
        amount,
        balance_before: currentCredits,
        balance_after: newCredits,
        created_at: new Date().toISOString(),
      }])
      .catch(() => {});

    return NextResponse.json({
      success: true,
      creditsRemaining: newCredits,
      action,
      costAmount: amount,
    });
  } catch (error) {
    console.error('Post credits error:', error);
    return NextResponse.json({ error: '扣费失败' }, { status: 500 });
  }
}