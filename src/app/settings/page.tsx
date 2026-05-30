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
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/entries', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/');
        return;
      }
      // For now, store user info in a simple way
      setLoading(false);
    } catch {
      router.push('/');
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Since we don't have a profile API yet, we'll save to localStorage as a simple approach
      localStorage.setItem('timeline_profile', JSON.stringify(profile));
      setMessage('✅ 资料保存成功');
    } catch {
      setMessage('❌ 保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    window.open('/api/export', '_blank');
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
                onChange={e => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
                placeholder="your_username"
              />
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
                <img src={profile.avatar_url} alt="预览" className="mt-2 w-16 h-16 rounded-full object-cover" />
              )}
            </div>

            {message && <p className="text-sm">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#B45309] text-white text-sm font-medium hover:bg-[#92400E] transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存资料'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="font-medium text-[#1C1917] mb-2">数据导出</h2>
          <p className="text-sm text-[#57534E] mb-4">导出所有时间轴节点 (JSON格式)，方便备份和迁移。</p>
          <button
            onClick={handleExport}
            className="px-6 py-2.5 rounded-xl border border-[#E7E5E4] text-[#57534E] text-sm font-medium hover:bg-[#FAFAF5] transition-colors"
          >
            📥 导出JSON
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 mt-6">
          <h2 className="font-medium text-[#1C1917] mb-2">关于</h2>
          <p className="text-sm text-[#57534E]">
            人生时间轴 v1.0 · 用文字和影像，珍藏你的人生故事。
          </p>
          <p className="text-sm text-[#A8A29E] mt-1">
            <a href={`/${profile.username || 'username'}`} className="text-[#B45309] hover:underline" target="_blank">
              查看我的公开时间轴 →
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}