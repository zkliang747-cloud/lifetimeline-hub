// Server component — handles metadata/SEO for user timeline pages
import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TimelineClient from './timeline-view';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('username', username)
    .maybeSingle();

  if (!profile) {
    return { title: '用户不存在 - 人生时间轴', description: '该用户不存在或未公开任何内容' };
  }

  const displayName = profile.display_name || profile.username;
  const description = profile.bio || `${displayName} 的人生时间轴 — 记录生命中每一个重要时刻。`;

  return {
    title: `${displayName} 的时间轴 - 人生时间轴`,
    description,
    openGraph: {
      title: `${displayName} 的人生时间轴`,
      description,
      type: 'profile',
      username: profile.username,
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {}),
    },
  };
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (!profile) notFound();

  return <TimelineClient username={username} />;
}