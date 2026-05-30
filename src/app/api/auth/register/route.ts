import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return NextResponse.json({ error: '所有字段都是必填的' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6个字符' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: '用户名只能包含字母、数字和下划线，3-20个字符' }, { status: 400 });
    }

    const { createUser, createSession, setSessionCookie } = await import('@/lib/auth');
    
    const user = await createUser(username, email, password);
    const token = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, display_name: user.display_name },
    });
    
    response.headers.append('Set-Cookie', setSessionCookie(token));
    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    const message = error?.message || '注册失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}