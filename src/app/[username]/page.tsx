// Server component — handles metadata/SEO for user timeline pages
import { readJSON } from '@/lib/store';
import TimelineClient from './timeline-view';

const DATA_DIR = '/tmp/timeline-data';
const USERS_FILE = `${DATA_DIR}/users.json`;

interface UserData {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  plan: string;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const users = await readJSON<UserData[]>(USERS_FILE, []);
  const user = users.find(u => u.username === username);

  if (!user) {
    return {
      title: '用户不存在 - 人生时间轴',
      description: '该用户不存在或未公开任何内容',
    };
  }

  const displayName = user.display_name || user.username;
  const description = user.bio || `${displayName} 的人生时间轴 — 记录生命中每一个重要时刻。`;

  return {
    title: `${displayName} 的时间轴 - 人生时间轴`,
    description,
    openGraph: {
      title: `${displayName} 的人生时间轴`,
      description,
      type: 'profile',
      ...(user.avatar_url && { images: [user.avatar_url] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} 的人生时间轴`,
      description,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <TimelineClient username={username} />;
}