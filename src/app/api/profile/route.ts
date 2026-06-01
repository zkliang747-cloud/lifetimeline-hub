import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, getSessionUser } from '@/lib/auth';
import { readJSON, writeJSON } from '@/lib/store';

const DATA_DIR = '/tmp/timeline-data';
const USERS_FILE = `${DATA_DIR}/users.json`;

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    return NextResponse.json({
      username: user.username,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      plan: user.plan,
      email: user.email,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: '获取资料失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    const user = await getSessionUser(token);
    
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, bio, avatar_url } = body;

    const users = await readJSON<any[]>(USERS_FILE, []);
    const idx = users.findIndex((u: any) => u.id === user.id);
    
    if (idx === -1) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    if (display_name !== undefined) users[idx].display_name = display_name;
    if (bio !== undefined) users[idx].bio = bio;
    if (avatar_url !== undefined) users[idx].avatar_url = avatar_url;

    await writeJSON(USERS_FILE, users);

    return NextResponse.json({
      success: true,
      profile: {
        username: users[idx].username,
        display_name: users[idx].display_name,
        bio: users[idx].bio,
        avatar_url: users[idx].avatar_url,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}