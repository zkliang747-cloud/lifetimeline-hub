'use client';

import { useEffect, useState, useRef } from 'react';
import { groupEntriesByYear } from '@/lib/utils';
import Link from 'next/link';
import { ChevronLeft, Share2 } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) return;
    fetchData();
  }, [username]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/public/${username}`);
      if (!res.ok) { setError('用户不存在或未公开任何内容'); return; }
      const data = await res.json();
      setProfile(data.profile);
      setEntries(data.entries);
    } catch {
      setError('用户不存在或未公开任何内容');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#A8A29E]">加载中...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4 opacity-40">📖</div>
        <p className="text-[#A8A29E] text-sm">{error || '用户不存在'}</p>
        <Link href="/" className="mt-4 text-xs text-[#B45309] hover:underline flex items-center gap-1">
          <ChevronLeft size={14} /> 返回首页
        </Link>
      </div>
    );
  }

  const grouped = groupEntriesByYear(entries);
  const years = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* 简洁顶部导航 */}
      <div className="sticky top-0 z-40 bg-[#FAFAF5]/80 backdrop-blur-lg border-b border-[#E7E5E4]">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
            <span className="text-sm">📖</span>
            <span className="font-serif text-sm font-semibold text-[#1C1917]">人生时间轴</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-xs text-[#57534E] hover:text-[#B45309] transition-colors"
            >
              <Share2 size={14} />
              {copied ? '已复制' : '分享'}
            </button>
            <Link href="/" className="text-xs text-[#A8A29E] hover:text-[#1C1917] transition-colors">
              返回首页
            </Link>
          </div>
        </div>
      </div>

      {/* 个人资料头部 */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
        {profile.avatar_url && (
          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-3 shadow-sm ring-2 ring-white" />
        )}
        <h1 className="font-serif text-2xl font-bold text-[#1C1917]">
          {profile.display_name || profile.username}
        </h1>
        {profile.bio && (
          <p className="text-sm text-[#A8A29E] mt-1 max-w-md mx-auto">{profile.bio}</p>
        )}
        <p className="text-xs text-[#D6D3D1] mt-1">共 {entries.length} 个重要时刻</p>
      </div>

      {years.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3 opacity-30">🕰️</div>
          <p className="text-sm text-[#A8A29E]">还没有公开的时间轴记录</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          {/* ====== 时间轴(竖线) ====== */}
          <div className="relative">
            {/* 中心轴线 */}
            <div className="absolute left-[18px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#B45309]/40 via-[#B45309]/20 to-[#B45309]/40 md:-translate-x-px" />

            {years.map((year, yi) => (
              <div key={year} className="relative mb-10 md:mb-16">
                {/* 年份标题 - 横向居中跨轴 */}
                <div className="relative z-10 flex items-center justify-center mb-6 md:mb-8">
                  <div className="bg-[#FAFAF5] px-3">
                    <span className="font-serif text-4xl md:text-5xl font-bold text-[#B45309] tracking-wide">
                      {year}
                    </span>
                  </div>
                </div>

                {/* 这一年的事件卡片 */}
                <div className="space-y-6 md:space-y-8">
                  {grouped[year].map((entry, ei) => {
                    const isLeft = ei % 2 === 0;
                    return (
                      <div key={entry.id} className="relative flex items-start">
                        {/* 移动端：圆点 + 卡片都在右侧 */}
                        <div className="md:hidden flex items-start gap-4 pl-0">
                          <div className="relative z-10 mt-1.5 w-[10px] h-[10px] rounded-full bg-[#B45309] ring-2 ring-[#FAFAF5] shrink-0" />
                          <div className="flex-1 min-w-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                            <EntryCard entry={entry} />
                          </div>
                        </div>

                        {/* 桌面端：交替左右排列 */}
                        <div className="hidden md:flex w-full items-start">
                          {/* 左侧卡片 */}
                          <div className={`w-[calc(50%-24px)] ${isLeft ? 'block' : 'invisible'}`}>
                            {isLeft && (
                              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                                <EntryCard entry={entry} />
                              </div>
                            )}
                          </div>

                          {/* 中心圆点 */}
                          <div className="relative z-10 shrink-0 mx-4 mt-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#B45309] ring-4 ring-[#FAFAF5]" />
                          </div>

                          {/* 右侧卡片 */}
                          <div className={`w-[calc(50%-24px)] ${!isLeft ? 'block' : 'invisible'}`}>
                            {!isLeft && (
                              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                                <EntryCard entry={entry} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8 border-t border-[#E7E5E4]">
        <p className="text-xs text-[#A8A29E]">
          用 <Link href="/" className="text-[#B45309] hover:underline">人生时间轴</Link> 创建属于你的时间线
        </p>
      </div>
    </div>
  );
}

/* 事件卡片子组件 */
function EntryCard({ entry }: { entry: TimelineEntry }) {
  return (
    <>
      <h3 className="font-serif text-base font-bold text-[#1C1917] mb-1.5 leading-snug">
        {entry.title}
      </h3>
      {entry.image_url && (
        <img
          src={entry.image_url}
          alt={entry.title}
          className="w-full rounded-lg mb-3 max-h-52 object-cover"
        />
      )}
      {entry.content && (
        <div className="text-xs text-[#57534E] leading-relaxed whitespace-pre-wrap line-clamp-4">
          {entry.content}
        </div>
      )}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map(tag => (
            <span key={tag} className="text-[10px] bg-[#FFFBEB] text-[#B45309] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}