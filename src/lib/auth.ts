import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'timeline_session';
const DATA_DIR = '/tmp/timeline-data';
const USERS_FILE = `${DATA_DIR}/users.json`;
const SESSIONS_FILE = `${DATA_DIR}/sessions.json`;

// Ensure data directory exists
async function ensureDataDir() {
  const fs = await import('fs/promises');
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch { /* ignore */ }
}

// Read JSON file
async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

// Write JSON file
async function writeJSON(filePath: string, data: unknown) {
  const fs = await import('fs/promises');
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===== User Types =====
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  plan: 'free' | 'sponsor';
  created_at: string;
}

export interface Session {
  token: string;
  user_id: string;
  created_at: string;
}

// ===== Auth Functions =====
export async function createUser(username: string, email: string, password: string): Promise<User> {
  const users = await readJSON<User[]>(USERS_FILE, []);
  
  if (users.find(u => u.username === username)) {
    throw new Error('用户名已被使用');
  }
  if (users.find(u => u.email === email)) {
    throw new Error('邮箱已被注册');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const password_hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex') + ':' + salt;

  const user: User = {
    id: crypto.randomUUID(),
    username,
    email,
    password_hash,
    display_name: username,
    bio: '',
    avatar_url: '',
    plan: 'free',
    created_at: new Date().toISOString(),
  };

  users.push(user);
  await writeJSON(USERS_FILE, users);
  return user;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const users = await readJSON<User[]>(USERS_FILE, []);
  const user = users.find(u => u.email === email);
  if (!user) return null;

  const [hash, salt] = user.password_hash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  return hash === verifyHash ? user : null;
}

export async function createSession(userId: string): Promise<string> {
  const sessions = await readJSON<Session[]>(SESSIONS_FILE, []);
  const token = crypto.randomBytes(32).toString('hex');
  
  sessions.push({
    token,
    user_id: userId,
    created_at: new Date().toISOString(),
  });

  await writeJSON(SESSIONS_FILE, sessions);
  return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
  if (!token) return null;
  const sessions = await readJSON<Session[]>(SESSIONS_FILE, []);
  const session = sessions.find(s => s.token === token);
  if (!session) return null;

  const users = await readJSON<User[]>(USERS_FILE, []);
  return users.find(u => u.id === session.user_id) || null;
}

export async function deleteSession(token: string) {
  const sessions = await readJSON<Session[]>(SESSIONS_FILE, []);
  await writeJSON(SESSIONS_FILE, sessions.filter(s => s.token !== token));
}

// ===== Cookie Helpers =====
export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value || '';
}

export function setSessionCookie(token: string) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ===== Sponsor Management =====
export async function updateUserPlan(email: string, plan: 'free' | 'sponsor'): Promise<boolean> {
  const users = await readJSON<User[]>(USERS_FILE, []);
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return false;
  users[idx].plan = plan;
  await writeJSON(USERS_FILE, users);
  return true;
}