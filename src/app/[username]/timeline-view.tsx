'use client';

import { useEffect, useState, useRef } from 'react';
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

function useShare() {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('链接已复制到剪贴板！');
    } catch {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('链接已复制到剪贴板！');
    }
  };

  const shareLink = async (data: { title: string; url: string }) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(data);
      } catch { /* user cancelled */ }
    } else {
      await copyToClipboard(data.url);
    }
  };

  return { copyToClipboard, shareLink };
}

export default function TimelineClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const { copyToClipboard, shareLink } = useShare();

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

  async function handleCopyLink() {
    const url = window.location.href;
    await copyToClipboard(url);
  }

  async function handleShare() {
    const url = window.location.href;
    await shareLink({ title: `${profile?.display_name || profile?.username} 的时间轴`, url });
  }

  async function handleGeneratePoster() {
    setGenerating(true);
    try {
      const { generatePoster } = await import('@/lib/poster');
      const canvas = await generatePoster({
        username: profile!.username,
        displayName: profile!.display_name || profile!.username,
        bio: profile!.bio,
        avatarUrl: profile!.avatar_url,
        entryCount: entries.length,
        entries: entries.slice(0, 6),
      });
      const link = document.createElement('a');
      link.download = `${profile!.username}-timeline-poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('海报生成失败，请重试');
    }
    setGenerating(false);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Top Nav Bar */}
      <div className="sticky top-0 z-40 bg-[#FAFAF5]/80 backdrop-blur-lg border-b border-[#E7E5E4]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="text-lg">📖</span>
            <span className="font-serif font-semibold text-sm text-[#1C1917]">人生时间轴</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="text-xs px-3 py-1.5 rounded-lg border border-[#D6D3D1] text-[#57534E] hover:bg-white transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              复制链接
            </button>
            <button onClick={handleGeneratePoster} disabled={generating} className="text-xs px-3 py-1.5 rounded-lg bg-[#B45309] text-white hover:bg-[#92400E] transition-colors flex items-center gap-1 disabled:opacity-50">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {generating ? '生成中...' : '生成海报'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#A8A29E] hover:text-[#B45309] mb-4 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回首页
          </Link>
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