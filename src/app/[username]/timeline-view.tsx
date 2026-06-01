'use client';

import { useEffect, useState } from 'react';
import { groupEntriesByYear } from '@/lib/utils';
import Link from 'next/link';

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
  updated_at: string;
}

interface UserProfile {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
}

export default function TimelineClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    fetchData();
  }, [username]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/public/${username}`);
      if (!res.ok) {
        setError('用户不存在或未公开任何内容');
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
      setEntries(data.entries);
    } catch {
      setError('用户不存在或未公开任何内容');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="text-[#57534E]">加载中...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-[#57534E]">{error || '用户不存在'}</p>
        <Link href="/" className="mt-4 text-[#B45309] hover:underline text-sm">返回首页</Link>
      </div>
    );
  }

  const grouped = groupEntriesByYear(entries);
  const years = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-sm" />
          )}
          <h1 className="font-serif text-3xl font-bold text-[#1C1917]">
            {profile.display_name || profile.username}
          </h1>
          {profile.bio && (
            <p className="text-[#57534E] mt-2 max-w-md mx-auto">{profile.bio}</p>
          )}
          <p className="text-xs text-[#A8A29E] mt-2">
            @{profile.username} · 共 {entries.length} 条记录
          </p>
        </div>

        {years.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A8A29E]">暂无公开内容</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-[#E7E5E4]" />

            {years.map(year => (
              <div key={year} className="relative mb-12">
                {/* Year Marker */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative z-10 w-16 h-16 rounded-full bg-[#B45309] flex items-center justify-center shadow-md">
                    <span className="font-serif text-xl font-bold text-white">{year}</span>
                  </div>
                  <div className="h-px flex-1 bg-[#E7E5E4]" />
                </div>

                {/* Entries for this year */}
                <div className="ml-20 space-y-6">
                  {grouped[year].map(entry => (
                    <div key={entry.id} className="group bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                      <h3 className="font-serif text-xl font-bold text-[#1C1917] mb-2">{entry.title}</h3>
                      
                      {entry.image_url && (
                        <img src={entry.image_url} alt={entry.title} className="w-full rounded-xl mb-3 max-h-64 object-cover" />
                      )}
                      
                      {entry.content && (
                        <div className="text-sm text-[#57534E] leading-relaxed whitespace-pre-wrap">{entry.content}</div>
                      )}
                      
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {entry.tags.map(tag => (
                            <span key={tag} className="text-xs bg-[#FFFBEB] text-[#B45309] px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-[#E7E5E4]">
          <p className="text-xs text-[#A8A29E]">
            用 <Link href="/" className="text-[#B45309] hover:underline">人生时间轴</Link> 创建你自己的时间轴网站
          </p>
        </div>
      </main>
    </div>
  );
}