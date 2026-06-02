'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feather, ImageIcon, Globe, Sparkles, Lock, Download, ArrowRight, Menu, X } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/users')
      .then(r => r.json())
      .then(data => { setPublicUsers(data.users || []); setUsersLoading(false); })
      .catch(() => setUsersLoading(false));
  }, []);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
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
      const body = isLogin ? { email, password } : { username, email, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '操作失败'); return; }
      router.push('/dashboard');
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* ====== 导航栏 ====== */}
      <nav className="fixed top-0 w-full bg-[#FAFAF5]/80 backdrop-blur-md z-50 border-b border-[#E7E5E4]/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="font-serif text-lg font-bold text-[#1C1917]">人生时间轴</span>
          </div>

          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-[#57534E] hover:text-[#1C1917] transition-colors">功能介绍</a>
            <a href="#about" className="text-sm text-[#57534E] hover:text-[#1C1917] transition-colors">关于我们</a>
            <button
              onClick={() => { setIsLogin(false); setShowAuth(true); }}
              className="text-sm px-5 py-2 rounded-xl bg-[#B45309] text-white font-medium hover:bg-[#92400E] transition-colors shadow-sm"
            >
              免费试用
            </button>
            <button
              onClick={() => { setIsLogin(true); setShowAuth(true); }}
              className="text-sm px-5 py-2 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium hover:bg-white transition-colors"
            >
              登录
            </button>
          </div>

          {/* 移动端汉堡菜单 */}
          <button className="md:hidden text-[#1C1917]" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 移动端下拉 */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-[#E7E5E4] px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-[#57534E] py-1" onClick={() => setMobileMenu(false)}>功能介绍</a>
            <a href="#about" className="block text-sm text-[#57534E] py-1" onClick={() => setMobileMenu(false)}>关于我们</a>
            <button
              onClick={() => { setIsLogin(false); setShowAuth(true); setMobileMenu(false); }}
              className="w-full py-2.5 rounded-xl bg-[#B45309] text-white font-medium text-sm"
            >
              免费试用
            </button>
            <button
              onClick={() => { setIsLogin(true); setShowAuth(true); setMobileMenu(false); }}
              className="w-full py-2.5 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium text-sm"
            >
              登录
            </button>
          </div>
        )}
      </nav>

      {/* ====== Hero 区域 ====== */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B45309]/10 text-[#B45309] text-sm font-medium mb-6">
            <Sparkles size={14} />
            完全免费 · 即刻开始记录
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#1C1917] leading-tight tracking-wide">
            把人生写成一条
            <span className="text-[#B45309]">温暖的故事线</span>
          </h1>
          <p className="mt-6 text-lg text-[#57534E] max-w-2xl mx-auto leading-relaxed">
            记录生命中每一个值得铭记的瞬间——毕业、旅行、升职、相遇。
            用文字和影像，让岁月不再模糊。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setIsLogin(false); setShowAuth(true); }}
              className="px-8 py-3.5 rounded-xl bg-[#B45309] text-white font-medium hover:bg-[#92400E] transition-colors shadow-lg shadow-[#B45309]/20 flex items-center gap-2"
            >
              免费开始使用
              <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium hover:bg-white transition-colors"
            >
              了解更多
            </a>
          </div>

          {/* 演示预览图 */}
          <div className="mt-16 mx-auto max-w-3xl">
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 md:p-8 border border-[#E7E5E4]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#B45309]/10 flex items-center justify-center text-lg">🧑</div>
                <div>
                  <p className="text-sm font-medium text-[#1C1917]">张三的人生记忆</p>
                  <p className="text-xs text-[#A8A29E]">记录了 23 个重要时刻</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { year: '2025', title: '新公司入职', desc: '加入了一家做 AI 产品的创业公司，感觉每天都能学到新东西。', tag: '职场' },
                  { year: '2024', title: '第一次出国旅行', desc: '日本京都的红叶季，美到让人说不出话。', tag: '旅行' },
                  { year: '2024', title: '研究生毕业', desc: '三年的研究生生涯画上句号，感谢导师和同学们的陪伴。', tag: '学业' },
                  { year: '2023', title: '开始学摄影', desc: '入手了第一台微单相机，开始记录生活中的光影。', tag: '爱好' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start border-l-2 border-[#B45309]/30 pl-4">
                    <span className="text-xs font-bold text-[#B45309] whitespace-nowrap min-w-[3rem]">{item.year}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-[#1C1917]">{item.title}</h4>
                      <p className="text-xs text-[#57534E] mt-0.5">{item.desc}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#B45309]/10 text-[#B45309]">{item.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 功能介绍 ====== */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-[#1C1917]">
            为什么选择人生时间轴？
          </h2>
          <p className="text-center text-[#57534E] mt-3 max-w-lg mx-auto">
            不只是记录，更是珍藏。每一个功能都为「叙事感」而设计。
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Feather, title: '按年份叙事', desc: '以年份为轴线，把人生故事像翻相册一样展开，清晰看见时间的轨迹。' },
              { icon: ImageIcon, title: '图文记忆', desc: '文字记录 + 图片上传，重要时刻不仅有文字，还有当时的画面。' },
              { icon: Globe, title: '公开主页', desc: '一键生成个人时间轴主页，和亲友分享你的人生故事。' },
              { icon: Sparkles, title: 'AI 文字润色', desc: '写得太朴素？AI 帮你润色成有温度的文字，免费用户每日 3 次。' },
              { icon: Lock, title: '隐私可控', desc: '每条记录可单独设置公开/私密，你的故事由你做主。' },
              { icon: Download, title: '数据导出', desc: '随时一键导出全部数据（JSON），你永远拥有自己的内容。' },
            ].map((feat, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-[#E7E5E4] hover:border-[#B45309]/30 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="w-10 h-10 rounded-xl bg-[#B45309]/10 flex items-center justify-center text-[#B45309] group-hover:bg-[#B45309] group-hover:text-white transition-colors">
                  <feat.icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold text-[#1C1917]">{feat.title}</h3>
                <p className="mt-2 text-sm text-[#57534E] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 发现时间轴 ====== */}
      <section className="py-20 px-4 bg-[#FAFAF5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-[#1C1917]">
            发现时间轴
          </h2>
          <p className="text-center text-[#57534E] mt-3 max-w-lg mx-auto">
            看看大家都在记录什么人生故事
          </p>

          <div className="mt-10">
            {usersLoading ? (
              <div className="text-center text-[#A8A29E] py-12">加载中...</div>
            ) : publicUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#A8A29E] mb-2">暂无公开记录</p>
                <button
                  onClick={() => { setIsLogin(false); setShowAuth(true); }}
                  className="text-[#B45309] text-sm hover:underline"
                >
                  成为第一个分享的人 →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicUsers.map((user: any) => (
                  <Link
                    key={user.id}
                    href={`/${user.username}`}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E7E5E4] hover:border-[#B45309]/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#B45309]/10 flex items-center justify-center text-[#B45309] font-bold text-lg shrink-0 overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                      ) : (
                        user.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1C1917] truncate group-hover:text-[#B45309] transition-colors">
                        {user.display_name}
                      </p>
                      {user.bio && <p className="text-xs text-[#A8A29E] truncate mt-0.5">{user.bio}</p>}
                      <p className="text-[10px] text-[#B45309] mt-1">
                        {user.entry_count} 条记录
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-[#A8A29E] group-hover:text-[#B45309] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            {publicUsers.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => { setIsLogin(false); setShowAuth(true); }}
                  className="text-sm text-[#B45309] hover:underline"
                >
                  注册后创建你的时间轴 →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====== 定价 / 免费试用 ====== */}
      <section className="py-20 px-4 bg-[#FAFAF5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1917]">开始记录你的人生故事</h2>
          <p className="mt-3 text-[#57534E]">无需信用卡，注册即享全部基础功能</p>
          <div className="mt-10 max-w-sm mx-auto">
            <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 border border-[#E7E5E4] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B45309] to-[#D97706]" />
              <p className="text-xs font-medium text-[#B45309] tracking-widest uppercase mb-2">当前方案</p>
              <p className="text-5xl font-bold text-[#1C1917]">免费</p>
              <p className="text-sm text-[#57534E] mt-2">永久免费 · 无隐藏费用</p>
              <ul className="mt-6 space-y-3 text-left">
                {[
                  '无限时间轴节点创建',
                  '支持图文记录',
                  '个人公开主页',
                  'AI 润色 · 每日 3 次',
                  '私密/公开自由切换',
                  'JSON 数据导出',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#57534E]">
                    <span className="text-[#065F46] mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setIsLogin(false); setShowAuth(true); }}
                className="mt-8 w-full py-3 rounded-xl bg-[#B45309] text-white font-medium hover:bg-[#92400E] transition-colors shadow-lg shadow-[#B45309]/20"
              >
                免费试用 →
              </button>
              <p className="mt-3 text-[10px] text-[#A8A29E]">无需绑定支付方式 · 注册即用</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 关于我们 ====== */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1917]">关于我们</h2>
          <p className="mt-4 text-[#57534E] leading-relaxed">
            人生时间轴是一款专注于「生命叙事」的产品。我们相信每个人都值得拥有一个
            温暖的地方来珍藏自己的回忆。无论是毕业典礼的兴奋、第一次旅行的震撼，
            还是日常生活中的点滴感动，都值得被认真记录。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-[#57534E]">
            <span>📖 始于 2025</span>
            <span>❤️ 免费 & 开放</span>
            <span>🔒 隐私优先</span>
          </div>
        </div>
      </section>

      {/* ====== 页脚 ====== */}
      <footer className="py-8 px-4 border-t border-[#E7E5E4] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A8A29E]">© 2025 人生时间轴 · 记录你的人生故事</p>
          <div className="flex items-center gap-4 text-xs text-[#A8A29E]">
            <span>用 ❤️ 打造</span>
          </div>
        </div>
      </footer>

      {/* ====== 登录/注册弹窗 ====== */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1C1917]" onClick={() => setShowAuth(false)}>
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <span className="text-3xl">📖</span>
              <h2 className="font-serif text-xl font-bold text-[#1C1917] mt-2">
                {isLogin ? '欢迎回来' : '开始记录'}
              </h2>
              <p className="text-xs text-[#57534E] mt-1">
                {isLogin ? '登录你的时间轴' : '注册账号，永久免费'}
              </p>
            </div>

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
              {error && <p className="text-[#BE123C] text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#B45309] text-white font-medium text-sm hover:bg-[#92400E] transition-colors disabled:opacity-50"
              >
                {loading ? '处理中...' : isLogin ? '登录' : '注册并开始记录'}
              </button>
            </form>

            <div className="mt-4 text-xs text-center text-[#A8A29E]">
              注册即表示同意
              <Link href="/terms" className="text-[#B45309] hover:underline mx-1">服务条款</Link>
              和
              <Link href="/privacy" className="text-[#B45309] hover:underline mx-1">隐私政策</Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] bg-white/80">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif font-bold text-[#1C1917] mb-3">📖 人生时间轴</h3>
              <p className="text-xs text-[#A8A29E]">把人生写成一条温暖的故事线</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#1C1917] mb-3">产品</h4>
              <ul className="space-y-2 text-xs text-[#57534E]">
                <li><Link href="/" className="hover:text-[#B45309] transition-colors">功能介绍</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#B45309] transition-colors">开始记录</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#1C1917] mb-3">法律</h4>
              <ul className="space-y-2 text-xs text-[#57534E]">
                <li><Link href="/privacy" className="hover:text-[#B45309] transition-colors">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-[#B45309] transition-colors">服务条款</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#1C1917] mb-3">联系</h4>
              <ul className="space-y-2 text-xs text-[#57534E]">
                <li>privacy@lifetimeline.app</li>
                <li>legal@lifetimeline.app</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E7E5E4] pt-6 text-center text-xs text-[#A8A29E]">
            <p>© {new Date().getFullYear()} 人生时间轴 LifeTimeline Hub. 保留所有权利。</p>
            <p className="mt-1">本服务按「现状」提供，使用即表示同意我们的服务条款和隐私政策。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}