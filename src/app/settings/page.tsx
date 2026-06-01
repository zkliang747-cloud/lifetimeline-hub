'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Settings() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    plan: 'free',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      if (data.username) {
        setProfile({
          username: data.username,
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          plan: data.plan || 'free',
        });
      }
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ 资料保存成功');
        if (data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }));
        }
      } else {
        setMessage('❌ ' + (data.error || '保存失败'));
      }
    } catch {
      setMessage('❌ 网络错误，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export', { credentials: 'include' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '导出失败');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'timeline-export.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('导出失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="text-[#57534E]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-[#1C1917] mb-8">⚙️ 账户设置</h1>

        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 mb-6">
          <h2 className="font-medium text-[#1C1917] mb-4">个人资料</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#57534E] mb-1">用户名</label>
              <input
                value={profile.username}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-[#F5F5F4] text-sm text-[#A8A29E] cursor-not-allowed"
              />
              <p className="text-xs text-[#A8A29E] mt-1">注册后不可修改</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#57534E] mb-1">显示名称</label>
              <input
                value={profile.display_name}
                onChange={e => setProfile({ ...profile, display_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
                placeholder="你的昵称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#57534E] mb-1">个人简介</label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all resize-none"
                placeholder="介绍一下自己..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#57534E] mb-1">头像URL</label>
              <input
                value={profile.avatar_url}
                onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
                placeholder="https://example.com/avatar.jpg"
              />
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt="预览" className="mt-2 w-16 h-16 rounded-full object-cover border-2 border-[#E7E5E4]" />
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-[#57534E]">
              <span>当前权益：</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                profile.plan === 'sponsor' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#F5F5F4] text-[#78716C]'
              }`}>
                {profile.plan === 'sponsor' ? '🌟 赞助版' : '免费版'}
              </span>
            </div>

            {message && <p className="text-sm">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#1C1917] text-white rounded-xl text-sm font-medium hover:bg-[#292524] transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存资料'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="font-medium text-[#1C1917] mb-2">数据导出</h2>
          <p className="text-sm text-[#57534E] mb-4">导出所有时间轴节点为 JSON 格式，便于备份和迁移。</p>
          <button
            onClick={handleExport}
            className="px-6 py-2.5 border border-[#D6D3D1] text-[#1C1917] rounded-xl text-sm font-medium hover:bg-[#F5F5F4] transition-colors"
          >
            导出 JSON
          </button>
        </div>
      </main>
    </div>
  );
}