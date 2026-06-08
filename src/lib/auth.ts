import { supabaseAdmin } from './supabase'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { readJSON, writeJSON } from './store'
import argon2 from 'argon2'

const DATA_DIR = process.env.COZE_PROJECT_ENV === 'PROD' ? '/tmp/timeline-data' : '/tmp/timeline-data'
const USERS_FILE = `${DATA_DIR}/users.json`
const SESSIONS_FILE = `${DATA_DIR}/sessions.json`

// ======== Supabase Auth (生产环境) ========

/** 从请求 cookie 中获取当前登录用户 */
export async function getSessionUser() {
  const token = await getTokenFromCookies()
  if (!token) return null
  
  // 优先使用 Supabase（生产环境）
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      // 降级到文件 auth
      return getFileSessionUser(token)
    }
    return data.user
  }
  
  // 降级到文件 auth（沙箱/开发环境）
  return getFileSessionUser(token)
}

/** 从请求 cookie 读取 token */
export async function getTokenFromCookies() {
  const cookieStore = await cookies()
  return cookieStore.get('timeline_session')?.value || null
}

/** 设置 session 到 cookie */
export function setSessionCookie(token: string) {
  return {
    name: 'timeline_session',
    value: token,
    attributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    },
  }
}

/** 清除 session cookie */
export function clearSessionCookie() {
  return {
    name: 'timeline_session',
    value: '',
    attributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
  }
}

// ======== 文件版 Auth（沙箱降级） ========

interface FileUser {
  id: string
  username: string
  email: string
  display_name: string
  bio: string
  avatar_url: string
  plan: string
  password_hash: string
  created_at: string
}

interface FileSession {
  token: string
  user_id: string
  expires_at: string
}

async function initFile() {
  await writeJSON(USERS_FILE, [])
  await writeJSON(SESSIONS_FILE, [])
}

async function getFileUsers(): Promise<FileUser[]> {
  try {
    const data = await readJSON(USERS_FILE)
    return Array.isArray(data) ? data : []
  } catch {
    await initFile()
    return []
  }
}

async function getFileSessions(): Promise<FileSession[]> {
  try {
    const data = await readJSON(SESSIONS_FILE)
    return Array.isArray(data) ? data : []
  } catch {
    await initFile()
    return []
  }
}

/**
 * 【P1 修复】使用 Argon2 进行密码哈希（更安全）
 * Argon2 是 OWASP 推荐的密码哈希算法
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // 使用 Argon2 进行哈希
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65540,  // 64 MB
      timeCost: 3,        // 3 iterations
      parallelism: 4,     // 4 parallel threads
    })
  } catch (error) {
    console.error('Argon2 hashing error:', error)
    // 降级到 pbkdf2（如果 argon2 不可用）
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 310000, 64, 'sha512').toString('hex')
    return `pbkdf2:${hash}:${salt}`
  }
}

/**
 * 【P1 修复】验证密码，支持多种哈希算法
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // 如果是 Argon2 格式
    if (!hash.startsWith('pbkdf2:')) {
      return await argon2.verify(hash, password)
    }
    
    // 如果是 pbkdf2 格式
    const [, storedHash, salt] = hash.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 310000, 64, 'sha512').toString('hex')
    return storedHash === verifyHash
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

export async function createFileUser(username: string, email: string, password: string) {
  const users = await getFileUsers()
  
  if (users.find(u => u.email === email)) {
    return { error: '该邮箱已注册' }
  }
  if (users.find(u => u.username === username)) {
    return { error: '该用户名已被使用' }
  }

  // 【P1 修复】使用强密码哈希
  const passwordHash = await hashPassword(password)
  
  const user: FileUser = {
    id: crypto.randomUUID(),
    username,
    email,
    display_name: username,
    bio: '',
    avatar_url: '',
    plan: 'free',
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  }
  
  users.push(user)
  await writeJSON(USERS_FILE, users)
  return { user: { id: user.id, username: user.username, email: user.email, display_name: user.display_name } }
}

export async function verifyFilePassword(email: string, password: string) {
  const users = await getFileUsers()
  const user = users.find(u => u.email === email)
  if (!user) return null
  
  // 【P1 修复】使用增强的密码验证
  const isValid = await verifyPassword(password, user.password_hash)
  return isValid ? user : null
}

export async function createFileSession(userId: string): Promise<string> {
  const sessions = await getFileSessions()
  const token = crypto.randomBytes(32).toString('hex')
  sessions.push({
    token,
    user_id: userId,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })
  await writeJSON(SESSIONS_FILE, sessions)
  return token
}

async function getFileSessionUser(token: string) {
  const sessions = await getFileSessions()
  const session = sessions.find(s => s.token === token)
  if (!session || new Date(session.expires_at) < new Date()) return null
  
  const users = await getFileUsers()
  const user = users.find(u => u.id === session.user_id)
  if (!user) return null
  
  return { id: user.id, email: user.email, user_metadata: { username: user.username, display_name: user.display_name } }
}

export async function deleteFileSession(token: string) {
  const sessions = await getFileSessions()
  const filtered = sessions.filter(s => s.token !== token)
  await writeJSON(SESSIONS_FILE, filtered)
}

export { getFileUsers, getFileSessions }
