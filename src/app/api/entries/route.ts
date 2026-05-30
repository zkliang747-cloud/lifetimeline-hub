import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies } from '@/lib/auth';
import { getAllEntries, createEntry } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    const { getSessionUser } = await import('@/lib/auth');
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const entries = await getAllEntries(user.id);
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Get entries error:', error);
    return NextResponse.json({ error: '获取记录失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    const { getSessionUser } = await import('@/lib/auth');
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { year, title, content, tags, is_public, image_url } = body;

    if (!year || !title) {
      return NextResponse.json({ error: '年份和标题不能为空' }, { status: 400 });
    }

    const entry = await createEntry({
      user_id: user.id,
      year: parseInt(year),
      title,
      content: content || '',
      tags: tags || [],
      is_public: is_public !== false,
      image_url: image_url || null,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Create entry error:', error);
    return NextResponse.json({ error: '创建记录失败' }, { status: 500 });
  }
}