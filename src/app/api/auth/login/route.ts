import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    const { verifyPassword, createSession, setSessionCookie } = await import('@/lib/auth');
    
    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const token = await createSession(user.id);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, display_name: user.display_name },
    });
    
    response.headers.append('Set-Cookie', setSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}