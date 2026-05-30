'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSponsor() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('sponsor');
  const [message, setMessage] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('处理中...');

    try {
      const key = adminKey || 'dev-admin-key';
      const res = await fetch('/api/admin/sponsor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ email, plan }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage('❌ 网络错误');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8 w-full max-w-md">
        <h1 className="font-serif text-2xl font-bold text-[#1C1917] mb-2">🔑 赞助用户管理</h1>
        <p className="text-sm text-[#57534E] mb-6">手动升级用户为赞助版</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#57534E] mb-1">管理员密钥</label>
            <input
              type="password"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
              placeholder="留空使用默认开发密钥"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#57534E] mb-1">用户邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
              placeholder="user@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#57534E] mb-1">设置权益</label>
            <select
              value={plan}
              onChange={e => setPlan(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
            >
              <option value="free">免费版</option>
              <option value="sponsor">赞助版</option>
            </select>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-[#B45309] text-white text-sm font-medium hover:bg-[#92400E] transition-colors">
            提交
          </button>

          {message && (
            <p className="text-sm text-center mt-2">{message}</p>
          )}
        </form>

        <p className="mt-6 text-xs text-[#A8A29E] text-center">
          <Link href="/" className="text-[#B45309] hover:underline">← 返回首页</Link>
        </p>
      </div>
    </div>
  );
}