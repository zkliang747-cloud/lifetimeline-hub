import { NextRequest, NextResponse } from 'next/server';

const DATA_DIR = '/tmp/timeline-data';
const USERS_FILE = `${DATA_DIR}/users.json`;
const ENTRIES_FILE = `${DATA_DIR}/entries.json`;

interface User {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  plan: string;
}

interface TimelineEntry {
  id: string;
  user_id: string;
  year: number;
  title: string;
  content: string;
  tags: string[];
  is_public: boolean;
  image_url: string | null;
  created_at: string;
}

async function readJSONFile<T>(filePath: string, fallback: T): Promise<T> {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    const user = users.find(u => u.username === username);

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const entries = await readJSONFile<TimelineEntry[]>(ENTRIES_FILE, []);
    const publicEntries = entries
      .filter(e => e.user_id === user.id && e.is_public)
      .sort((a, b) => a.year - b.year || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return NextResponse.json({
      profile: {
        username: user.username,
        display_name: user.display_name,
        bio: user.bio,
        avatar_url: user.avatar_url,
      },
      entries: publicEntries,
    });
  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}