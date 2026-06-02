import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '隐私政策 - 人生时间轴',
  description: '人生时间轴（LifeTimeline Hub）隐私政策，说明我们如何收集、使用和保护您的个人信息。',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <nav className="border-b border-[#E7E5E4] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-bold text-[#1C1917]">📖 人生时间轴</Link>
          <Link href="/" className="text-sm text-[#57534E] hover:text-[#1C1917] transition-colors">← 返回首页</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-[#1C1917] mb-2">隐私政策</h1>
        <p className="text-sm text-[#A8A29E] mb-8">最后更新日期：2026 年 6 月</p>

        <div className="prose prose-sm max-w-none text-[#44403C] space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">一、信息收集</h2>
            <p>我们收集您在使用人生时间轴服务时主动提供的以下信息：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>注册信息</strong>：用户名、邮箱地址、经过加密处理的密码</li>
              <li><strong>个人资料</strong>：显示名称、个人简介、头像图片</li>
              <li><strong>时间轴内容</strong>：您创建的时间节点中的文字、图片、标签等信息</li>
              <li><strong>使用数据</strong>：AI 润色功能的调用次数（仅用于功能限制）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">二、信息使用</h2>
            <p>我们收集的信息仅用于以下目的：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>提供、维护和改善人生时间轴服务</li>
              <li>实现用户认证和账户管理</li>
              <li>展示您选择公开的时间轴内容</li>
              <li>提供 AI 文字润色等增值功能</li>
              <li>发送服务相关的通知（如有）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">三、数据存储与安全</h2>
            <p>您的时间轴数据存储在我们的服务器上。我们采用以下安全措施保护您的数据：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>密码使用 PBKDF2 加盐哈希加密存储，我们无法获取您的原始密码</li>
              <li>会话使用 HttpOnly Cookie，防止 XSS 攻击窃取登录态</li>
              <li>图片存储采用对象存储服务，具备访问控制</li>
              <li>数据传输全程使用 HTTPS 加密</li>
            </ul>
            <p className="mt-2 text-[#BE123C] text-sm font-medium">请注意：数据存储在当前服务器环境的临时目录中。我们建议您定期通过「数据导出」功能备份重要数据。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">四、信息公开与分享</h2>
            <p>您可以控制每条时间轴节点的隐私设置：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>公开节点</strong>：可被任何人通过您的公开主页查看</li>
              <li><strong>私密节点</strong>：仅您自己可见</li>
            </ul>
            <p>我们不会将您的个人信息出售或分享给第三方，除非：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>获得您的明确同意</li>
              <li>法律法规要求</li>
              <li>保护我们的合法权益</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">五、数据导出与删除</h2>
            <p>您有权：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>导出数据</strong>：在设置页面可一键导出所有时间轴数据为 JSON 格式</li>
              <li><strong>删除内容</strong>：可随时删除任何时间轴节点</li>
              <li><strong>注销账户</strong>：如需注销账户，请通过下方联系方式联系我们</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">六、免责声明</h2>
            <p>人生时间轴（LifeTimeline Hub）按「现状」提供服务。在法律允许的最大范围内，我们不对以下情况承担责任：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>因不可抗力导致的服务中断或数据丢失</li>
              <li>用户发布内容侵犯第三方权益所产生的纠纷</li>
              <li>第三方服务（如 AI 模型、存储服务）的故障或异常</li>
              <li>因用户自身原因（如密码泄露）导致的账户安全问题</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">七、政策更新</h2>
            <p>我们可能会不时更新本隐私政策。重大变更时，我们将在网站首页显著位置通知。继续使用本服务即表示您同意更新后的政策。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">八、联系我们</h2>
            <p>如对隐私政策有任何疑问，或需要行使数据权利，请通过以下方式联系我们：</p>
            <p className="text-[#B45309]">邮箱：privacy@lifetimeline.app</p>
          </section>

          <div className="pt-6 border-t border-[#E7E5E4]">
            <Link href="/terms" className="text-[#B45309] hover:underline text-sm">查看服务条款 →</Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-[#E7E5E4] py-6 mt-12">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-[#A8A29E]">
          <p>© {new Date().getFullYear()} 人生时间轴 LifeTimeline Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}