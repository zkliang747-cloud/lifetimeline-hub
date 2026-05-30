import { NextResponse } from 'next/server';
import { getTokenFromCookies, getSessionUser, deleteSession, clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    const token = await getTokenFromCookies();
    if (token) {
      await deleteSession(token);
    }
  } catch {
    // ignore
  }

  const response = NextResponse.redirect(new URL('/', process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000'));
  response.headers.append('Set-Cookie', clearSessionCookie());
  return response;
}