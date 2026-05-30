import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, getSessionUser } from '@/lib/auth';
import { updateEntry, deleteEntry } from '@/lib/store';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getTokenFromCookies();
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const result = await updateEntry(id, user.id, body);
    if (!result) {
      return NextResponse.json({ error: '记录不存在或无权修改' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Update entry error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getTokenFromCookies();
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteEntry(id, user.id);
    if (!success) {
      return NextResponse.json({ error: '记录不存在或无权删除' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete entry error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}