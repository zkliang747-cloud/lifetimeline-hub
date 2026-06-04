import { supabaseAdmin } from './supabase'

// ============ Profiles ============

export async function getProfile(userId: string) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function getProfileByUsername(username: string) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  return data
}

export async function updateProfile(userId: string, updates: {
  display_name?: string
  bio?: string
  avatar_url?: string
}) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
  return error
}

export async function listPublicUsers() {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .limit(50)
  return data || []
}

// ============ Entries ============

export async function getEntries(userId: string) {
  const { data } = await supabaseAdmin
    .from('timeline_entries')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })
  return data || []
}

export async function getPublicEntries(username: string) {
  const profile = await getProfileByUsername(username)
  if (!profile) return []
  const { data } = await supabaseAdmin
    .from('timeline_entries')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('year', { ascending: true })
    .order('created_at', { ascending: true })
  return data || []
}

export async function createEntry(userId: string, entry: {
  year: number
  title: string
  content?: string
  tags?: string[]
  is_public?: boolean
  image_url?: string
}) {
  const { data, error } = await supabaseAdmin
    .from('timeline_entries')
    .insert([{
      user_id: userId,
      year: entry.year,
      title: entry.title,
      content: entry.content || '',
      tags: entry.tags || [],
      is_public: entry.is_public ?? true,
      image_url: entry.image_url || '',
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEntry(id: string, userId: string, updates: {
  year?: number
  title?: string
  content?: string
  tags?: string[]
  is_public?: boolean
  image_url?: string
}) {
  const { error } = await supabaseAdmin
    .from('timeline_entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
  return error
}

export async function deleteEntry(id: string, userId: string) {
  const { error } = await supabaseAdmin
    .from('timeline_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  return error
}

// ============ AI Usage ============

export async function getAiUsage(userId: string, date: string) {
  const { data } = await supabaseAdmin
    .from('ai_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()
  return data?.count || 0
}

export async function incrementAiUsage(userId: string, date: string) {
  const existing = await getAiUsage(userId, date)
  if (existing === 0) {
    await supabaseAdmin
      .from('ai_usage')
      .insert([{ user_id: userId, date, count: 1 }])
  } else {
    await supabaseAdmin
      .from('ai_usage')
      .update({ count: existing + 1 })
      .eq('user_id', userId)
      .eq('date', date)
  }
}

// ============ Admin ============

export async function updateUserPlan(email: string, plan: string) {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)
  if (!user) throw new Error('用户不存在')
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ plan })
    .eq('id', user.id)
  if (error) throw error
  return user
}

export async function getEntryCountByUsername(username: string) {
  const profile = await getProfileByUsername(username)
  if (!profile) return 0
  const { count } = await supabaseAdmin
    .from('timeline_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('is_public', true)
  return count || 0
}

// ============================================
// 文件存储回退 (当 Supabase 不可用时)
// ============================================
const DATA_DIR = '/tmp/timeline-data'

export async function readJSON(filename: string): Promise<any> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const filePath = path.join(DATA_DIR, filename)
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

export async function writeJSON(filename: string, data: any): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const filePath = path.join(DATA_DIR, filename)
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch {}
}