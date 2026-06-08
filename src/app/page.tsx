'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feather, ImageIcon, Globe, Sparkles, Lock, Download, ArrowRight, Menu, X, Eye, EyeOff } from 'lucide-react';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch('/api/public/users')
      .then(r => r.json())
      .then(data => { setPublicUsers(data.users || []); setUsersLoading(false); })
      .catch(() => setUsersLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/entries', { credentials: 'include' })
      .then(r => { if (r.ok) router.push('/dashboard'); })
      .catch(() => {});
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isLogin) {
      if (username.length < 3) {
        newErrors.username = '用户名至少3个字符';
      }
      if (username.length > 20) {
        newErrors.username = '用户名最多20个字符';
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        newErrors.username = '用户名只能包含字母、数字、下划线';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (password.length < 6) {
      newErrors.password = '密码至少6个字符';
    }
    if (!isLogin && password.length > 50) {
      newErrors.password = '密码过长';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

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

      if (!res.ok) {
        setErrors({ general: data.error || '操作失败，请重试' });
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setErrors({ general: '网络错误，请检查连接后重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* 导航栏 */}
      <nav className="fixed top-0 w-full bg-[#FAFAF5]/80 backdrop-blur-md z-50 border-b border-[#E7E5E4]/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="font-serif text-lg font-bold text-[#1C1917]">人生时间轴</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-[#57534E] hover:text-[#1C1917] transition-colors">功能介绍</a>
            <a href="#about" className="text-sm text-[#57534E] hover:text-[#1C1917] transition-colors">关于我们</a>
            <button
              onClick={() => { setIsLogin(false); setShowAuth(true); }}
              className="text-sm px-5 py-2 rounded-xl bg-[#B45309] text-white font-medium hover:bg-[#92400E] transition-colors shadow-sm"
            >
              开始使用
            </button>
            <button
              onClick={() => { setIsLogin(true); setShowAuth(true); }}
              className="text-sm px-5 py-2 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium hover:bg-white transition-colors"
            >
              登录
            </button>
          </div>

          <button className="md:hidden text-[#1C1917]" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-[#E7E5E4] px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-[#57534E] py-2" onClick={() => setMobileMenu(false)}>功能介绍</a>
            <a href="#about" className="block text-sm text-[#57534E] py-2" onClick={() => setMobileMenu(false)}>关于我们</a>
            <button
              onClick={() => { setIsLogin(false); setShowAuth(true); setMobileMenu(false); }}
              className="w-full py-3 rounded-xl bg-[#B45309] text-white font-medium text-sm min-h-[44px]"
            >
              开始使用
            </button>
            <button
              onClick={() => { setIsLogin(true); setShowAuth(true); setMobileMenu(false); }}
              className="w-full py-3 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium text-sm min-h-[44px]"
            >
              登录
            </button>
          </div>
        )}
      </nav>

      {/* Hero 区域 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B45309]/10 text-[#B45309] text-sm font-medium mb-6">
            <Sparkles size={14} />
            用心记录 · 让时光有迹可循
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#1C1917] leading-tight tracking-wide">
            把人生写成一条
            <span className="text-[#B45309]">温暖的故事线</span>
          </h1>
          <p className="mt-6 text-lg text-[#57534E] max-w-2xl mx-auto leading-relaxed">
            记录生命中每一个值得铭记的瞬间——毕业、旅行、升职、相遇。用文字和影像，让岁月不再模糊。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setIsLogin(false); setShowAuth(true); }}
              className="px-8 py-3.5 rounded-xl bg-[#B45309] text-white font-medium hover:bg-[#92400E] transition-colors shadow-lg shadow-[#B45309]/20 flex items-center gap-2 min-h-[44px]"
            >
              开始记录
              <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium hover:bg-white transition-colors min-h-[44px] flex items-center justify-center"
            >
              了解更多
            </a>
          </div>

          {/* 演示预览 */}
          <div className="mt-16 mx-auto max-w-lg">
            <div className="relative pl-8">
              <div className="absolute left-[7px] top-1 bottom-0 w-[2px] bg-gradient-to-b from-[#B45309]/40 to-[#B45309]/10" />
              {[
                { year: '2025', title: '新公司入职', desc: '加入了一家做 AI 产品的创业公司，迎接新的挑战。', tag: '职场' },
                { year: '2024', title: '京都之旅', desc: '红叶季的京都，美到让人说不出话。', tag: '旅行' },
                { year: '2024', title: '研究生毕业', desc: '三年时光画上句号，感谢一路相伴的人。', tag: '学业' },
                { year: '2023', title: '开始学摄影', desc: '入手第一台微单，记录生活中的光影。', tag: '爱好' },
              ].map((item, i) => (
                <div key={i} className="relative pb-6 last:pb-0">
                  <div className="absolute left-[-16px] top-1 w-[15px] h-[15px] rounded-full bg-[#B45309] ring-2 ring-[#FAFAF5]" />
                  <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4 md:p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#B45309]">{item.year}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309]/70">{item.tag}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#1C1917]">{item.title}</h4>
                    <p className="text-xs text-[#57534E] mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-[#A8A29E] mt-6">这就是你的时间轴 · 点击下方开始创建</p>
          </div>
        </div>
      </section>

      {/* 功能介绍 */}
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

      {/* 发现时间轴 */}
      <section className="py-20 px-4 bg-[#FAFAF5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-[#1C1917]">发现时间轴</h2>
          <p className="text-center text-[#57534E] mt-3 max-w-lg mx-auto">看看大家都在记录什么人生故事</p>

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
                      <p className="text-[10px] text-[#B45309] mt-1">{user.entry_count} 条记录</p>
                    </div>
                    <ArrowRight size={16} className="text-[#A8A29E] group-hover:text-[#B45309] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 定价方案 */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-[#1C1917]">选择你的方案</h2>
          <p className="text-center text-[#57534E] mt-3 max-w-lg mx-auto text-sm">灵活消耗积分，按需升级，所有功能成本透明</p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 免费版 */}
            <div className="bg-[#FAFAF5] rounded-2xl p-6 md:p-8 border border-[#E7E5E4] relative flex flex-col">
              <p className="text-xs font-medium text-[#B45309] tracking-widest uppercase mb-2">入门版</p>
              <p className="text-4xl font-bold text-[#1C1917]">免费</p>
              <p className="text-xs text-[#A8A29E] mt-1">永久免费，每月赠送 10 积分</p>

              <ul className="mt-6 space-y-3 flex-1">
                {[
                  '无限时间轴节点',
                  '支持图文记录',
                  '个人公开主页',
                  'AI 润色 · 每日 3 次',
                  '私密/公开切换',
                  'JSON 数据导出',
                  '基础功能完全免费',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#57534E]">
                    <span className="text-[#065F46] mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { setIsLogin(false); setShowAuth(true); }}
                className="mt-6 w-full py-3 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium hover:bg-white transition-colors text-sm min-h-[44px]"
              >
                立即开始
              </button>
            </div>

            {/* 基础版 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-[#B45309] shadow-[0_8px_32px_rgba(180,83,9,0.12)] relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B45309] text-white text-xs px-4 py-1 rounded-full font-medium">
                最受欢迎
              </div>
              <p className="text-xs font-medium text-[#B45309] tracking-widest uppercase mb-2">基础版</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#1C1917]">¥9.9</span>
                <span className="text-sm text-[#57534E]">(100 积分)</span>
              </div>
              <p className="text-xs text-[#A8A29E] mt-1">适合轻度使用者</p>

              <div className="mt-4 p-3 bg-[#FFFBEB] rounded-lg text-xs text-[#B45309]">
                💡 积分消耗详情：
                <ul className="mt-1.5 space-y-1 text-[#92400E]">
                  <li>• AI 润色：3 积分/次</li>
                  <li>• PDF 导出：5 积分/次</li>
                  <li>• 海报生成：2 积分/次</li>
                </ul>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {[
                  '100 积分额度',
                  'AI 润色无限次数',
                  '每节点最多 5 张图片',
                  '单图最大 5MB',
                  '基础分享功能',
                  '优先级支持',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#57534E]">
                    <span className="text-[#B45309] mt-0.5 shrink-0">✦</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { setIsLogin(false); setShowAuth(true); }}
                className="mt-6 w-full py-3 rounded-xl bg-[#B45309] text-white font-medium hover:bg-[#92400E] transition-colors shadow-lg shadow-[#B45309]/20 text-sm min-h-[44px]"
              >
                立即购买
              </button>
            </div>

            {/* 高级版 */}
            <div className="bg-[#FAFAF5] rounded-2xl p-6 md:p-8 border border-[#E7E5E4] relative flex flex-col">
              <p className="text-xs font-medium text-[#B45309] tracking-widest uppercase mb-2">高级版</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#1C1917]">¥49.9</span>
                <span className="text-sm text-[#57534E]">(1000 积分)</span>
              </div>
              <p className="text-xs text-[#A8A29E] mt-1">省 50%，适合长期使用者</p>

              <div className="mt-4 p-3 bg-[#FFFBEB] rounded-lg text-xs text-[#B45309]">
                🎁 额外赠送：
                <ul className="mt-1.5 space-y-1 text-[#92400E]">
                  <li>• 100 额外积分（赠送）</li>
                  <li>• 年度 AI 报告 1 次</li>
                  <li>• 无限图片上传</li>
                </ul>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {[
                  '1000 积分额度 + 100 赠送',
                  'AI 润色无限次数',
                  '每节点最多 20 张图片',
                  '单图最大 20MB',
                  '高级分享功能',
                  '优先级客服支持',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#57534E]">
                    <span className="text-[#B45309] mt-0.5 shrink-0">✦</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { setIsLogin(false); setShowAuth(true); }}
                className="mt-6 w-full py-3 rounded-xl border border-[#D6D3D1] text-[#1C1917] font-medium hover:bg-white transition-colors text-sm min-h-[44px]"
              >
                立即购买
              </button>
            </div>
          </div>

          {/* 成本说明 */}
          <div className="mt-10 text-center text-xs text-[#A8A29E] max-w-xl mx-auto space-y-1">
            <p>✨ 功能成本完全透明</p>
            <p>定价覆盖：服务器存储 · AI API 调用 · 图片 CDN · 域名与带宽</p>
            <p>免费用户年均成本 ¥11 · 高级版用户平均每日成本 ¥0.14</p>
          </div>
        </div>
      </section>

      {/* 关于我们 */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1917]">关于我们</h2>
          <p className="mt-4 text-[#57534E] leading-relaxed">
            人生时间轴是一款专注于「生命叙事」的产品。我们相信每个人都值得拥有一个温暖的地方来珍藏自己的回忆。无论是毕业典礼的兴奋、第一次旅行的震撼，还是日常生活中的点滴感动，都值得被认真记录。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-[#57534E]">
            <span>📖 始于 2025</span>
            <span>❤️ 免费 & 开放</span>
            <span>🔒 隐私优先</span>
          </div>
          <div className="mt-8 p-4 bg-[#FFFBEB] rounded-lg text-sm text-[#92400E]">
            📧 有任何问题或建议？
            <a href="mailto:zkl3@msn.com" className="text-[#B45309] hover:underline font-medium ml-2">
              联系我们：zkl3@msn.com
            </a>
          </div>
        </div>
      </section>

      {/* 登录/注册弹窗 */}
      {showAuth && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAuth(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm max-h-[90vh] overflow-y-auto relative my-8"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#1C1917] transition-colors"
              onClick={() => setShowAuth(false)}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <span className="text-3xl">📖</span>
              <h2 className="font-serif text-xl font-bold text-[#1C1917] mt-2">
                {isLogin ? '欢迎回来' : '开始记录'}
              </h2>
              <p className="text-xs text-[#57534E] mt-1">
                {isLogin ? '登录你的时间轴' : '注册账号 · 即刻开始'}
              </p>
            </div>

            {/* 标签页切换 */}
            <div className="flex mb-6 bg-[#FAFAF5] rounded-xl p-1">
              <button
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${isLogin ? 'bg-white shadow-sm text-[#1C1917]' : 'text-[#57534E] hover:text-[#1C1917]'}`}
                onClick={() => {
                  setIsLogin(true);
                  setErrors({});
                }}
              >
                登录
              </button>
              <button
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${!isLogin ? 'bg-white shadow-sm text-[#1C1917]' : 'text-[#57534E] hover:text-[#1C1917]'}`}
                onClick={() => {
                  setIsLogin(false);
                  setErrors({});
                }}
              >
                注册
              </button>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[#57534E] mb-2">用户名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      if (errors.username) {
                        setErrors({ ...errors, username: undefined });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm bg-white transition-all focus:outline-none focus:ring-2 ${errors.username ? 'border-[#BE123C] focus:ring-[#BE123C]/20 focus:border-[#BE123C]' : 'border-[#E7E5E4] focus:ring-[#B45309]/20 focus:border-[#B45309]'}`}
                    placeholder="3-20位字母/数字/下划线"
                    required={!isLogin}
                    minLength={3}
                    maxLength={20}
                    disabled={loading}
                  />
                  {errors.username && <p className="text-xs text-[#BE123C] mt-1.5 flex items-center gap-1">⚠️ {errors.username}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-2">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm bg-white transition-all focus:outline-none focus:ring-2 ${errors.email ? 'border-[#BE123C] focus:ring-[#BE123C]/20 focus:border-[#BE123C]' : 'border-[#E7E5E4] focus:ring-[#B45309]/20 focus:border-[#B45309]'}`}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
                {errors.email && <p className="text-xs text-[#BE123C] mt-1.5 flex items-center gap-1">⚠️ {errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-2">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm bg-white transition-all focus:outline-none focus:ring-2 ${errors.password ? 'border-[#BE123C] focus:ring-[#BE123C]/20 focus:border-[#BE123C]' : 'border-[#E7E5E4] focus:ring-[#B45309]/20 focus:border-[#B45309]'}`}
                    placeholder={isLogin ? '输入密码' : '至少6个字符'}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#57534E] transition-colors p-1 rounded touch-manipulation"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-[#BE123C] mt-1.5 flex items-center gap-1">⚠️ {errors.password}</p>}
              </div>

              {errors.general && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                  <p className="text-xs text-[#BE123C] flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{errors.general}</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#B45309] text-white font-medium text-sm transition-all hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block animate-spin">⏳</span>
                    处理中...
                  </span>
                ) : isLogin ? (
                  '登录'
                ) : (
                  '注册并开始记录'
                )}
              </button>
            </form>

            {/* 服务条款 */}
            <div className="mt-4 text-xs text-center text-[#A8A29E]">
              注册即表示同意
              <Link href="/terms" className="text-[#B45309] hover:underline mx-1">
                服务条款
              </Link>
              和
              <Link href="/privacy" className="text-[#B45309] hover:underline mx-1">
                隐私政策
              </Link>
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
                <li><a href="mailto:zkl3@msn.com" className="hover:text-[#B45309] transition-colors">zkl3@msn.com</a></li>
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