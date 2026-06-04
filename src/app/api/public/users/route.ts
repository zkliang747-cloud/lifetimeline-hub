import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .limit(50)

  if (!profiles) return NextResponse.json({ users: [] })

  // 获取每个用户公开条目的数量
  const userIds = profiles.map(p => p.id)
  const { data: counts } = await supabaseAdmin
    .from('timeline_entries')
    .select('user_id')
    .in('user_id', userIds)
    .eq('is_public', true)

  const entryCountMap: Record<string, number> = {}
  if (counts) {
    counts.forEach(e => {
      entryCountMap[e.user_id] = (entryCountMap[e.user_id] || 0) + 1
    })
  }

  const users = profiles
    .map(p => ({
      ...p,
      entry_count: entryCountMap[p.id] || 0,
    }))
    .filter(u => u.entry_count > 0)

  return NextResponse.json({ users })
}