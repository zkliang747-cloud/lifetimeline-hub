import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, getSessionUser } from '@/lib/auth';
import { getAllEntries } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const entries = await getAllEntries(user.id);
    const sorted = entries.sort((a, b) => a.year - b.year || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Return as downloadable JSON
    const jsonStr = JSON.stringify(sorted, null, 2);
    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="timeline-export.json"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: '导出失败' }, { status: 500 });
  }
}