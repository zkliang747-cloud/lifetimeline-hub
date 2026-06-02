import { NextResponse } from 'next/server';
import { getPublicUsers } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getPublicUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch public users:', error);
    return NextResponse.json({ users: [], error: '获取失败' }, { status: 500 });
  }
}