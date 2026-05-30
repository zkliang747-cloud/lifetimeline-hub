'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    fetch('/api/entries', { credentials: 'include' })
      .then(r => { if (r.ok) router.push('/dashboard'); })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { username, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '操作失败');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center p-4">
      {/* 品牌区 */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="font-serif text-4xl font-bold text-[#1C1917] tracking-wide">
          人生时间轴
        </h1>
        <p className="text-[#57534E] mt-3 text-lg max-w-md">
          记录你生命中的每一个重要瞬间，<br />
          让岁月化作一条温暖的故事线
        </p>
      </div>

      {/* 登录/注册表单 */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8">
          <div className="flex mb-6 bg-[#FAFAF5] rounded-xl p-1">
            <button
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${isLogin ? 'bg-white shadow-sm text-[#1C1917]' : 'text-[#57534E]'}`}
              onClick={() => setIsLogin(true)}
            >
              登录
            </button>
            <button
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${!isLogin ? 'bg-white shadow-sm text-[#1C1917]' : 'text-[#57534E]'}`}
              onClick={() => setIsLogin(false)}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
                  placeholder="3-20位字母/数字/下划线"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#57534E] mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#57534E] mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
                placeholder={isLogin ? '输入密码' : '至少6个字符'}
                required
                minLength={isLogin ? 1 : 6}
              />
            </div>

            {error && (
              <p className="text-[#BE123C] text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#B45309] text-white font-medium text-sm hover:bg-[#92400E] transition-colors disabled:opacity-50"
            >
              {loading ? '处理中...' : isLogin ? '登录' : '注册并开始记录'}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-[#A8A29E]">
            注册即表示你同意我们的服务条款
          </p>
        </div>
      </div>

      {/* 页脚 */}
      <p className="mt-8 text-xs text-[#A8A29E]">
        用文字和影像，珍藏你的人生故事
      </p>
    </div>
  );
}