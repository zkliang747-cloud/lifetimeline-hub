import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from './auth'

/**
 * 【代码质量优化】
 * 提取通用认证中间件，统一处理 401 响应
 * 避免在每个 API 端点重复代码
 */
export async function requireAuth(req?: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return {
      error: true,
      response: NextResponse.json({ error: '未登录' }, { status: 401 }),
      user: null,
    }
  }
  return { error: false, response: null, user }
}

/**
 * CORS 和安全头配置
 */
export function securityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  return response
}
