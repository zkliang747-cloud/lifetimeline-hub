import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '服务条款 - 人生时间轴',
  description: '人生时间轴（LifeTimeline Hub）服务条款，说明使用本服务的权利义务与限制。',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <nav className="border-b border-[#E7E5E4] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-bold text-[#1C1917]">📖 人生时间轴</Link>
          <Link href="/" className="text-sm text-[#57534E] hover:text-[#1C1917] transition-colors">← 返回首页</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-[#1C1917] mb-2">服务条款</h1>
        <p className="text-sm text-[#A8A29E] mb-8">最后更新日期：2026 年 6 月</p>

        <div className="prose prose-sm max-w-none text-[#44403C] space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">一、服务说明</h2>
            <p>人生时间轴（LifeTimeline Hub）是一个允许用户按时间线记录、管理和分享人生重要时刻的在线平台（以下简称「本服务」）。</p>
            <p>本服务由开发者个人提供，当前处于开发和测试阶段。我们保留随时修改、暂停或终止服务的权利，恕不另行通知。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">二、用户账户</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>您必须提供真实、准确的注册信息</li>
              <li>您对账户下的所有活动负责，请妥善保管密码</li>
              <li>一个邮箱只能注册一个账户</li>
              <li>如发现账户异常，请立即通过下方联系方式通知我们</li>
              <li>我们保留因违反条款而暂停或终止账户的权利</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">三、用户内容</h2>
            <p>您保留您发布内容的所有权。通过发布内容，您授予我们非独占的、全球性的许可，以在平台上展示和分发这些内容。</p>
            <p>您承诺不发布以下内容：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>违反法律法规的信息</li>
              <li>侵犯他人合法权益的内容</li>
              <li>色情、暴力、赌博等不良信息</li>
              <li>垃圾广告或恶意推广</li>
              <li>包含恶意代码或病毒的内容</li>
            </ul>
            <p>我们有权删除违反上述规定的内容，并保留向有关部门举报的权利。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">四、AI 服务</h2>
            <p>本服务提供 AI 文字润色功能，使用大语言模型技术。您理解并同意：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>AI 生成的内容仅供参考，不构成专业建议</li>
              <li>AI 输出可能存在不准确、不完整或不当的内容</li>
              <li>免费账户每日 AI 调用次数有限制，具体限制以平台为准</li>
              <li>我们不对 AI 输出的准确性、完整性和合法性承担责任</li>
              <li>您不应将敏感或机密信息提交给 AI 处理</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">五、知识产权</h2>
            <p>本服务的名称、Logo、界面设计、源代码等知识产权归开发者所有。未经授权，您不得复制、修改、分发或反向工程本服务的任何部分。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">六、免责声明</h2>
            <p>本服务按「现状」和「可用」基础提供，不作任何明示或暗示的保证，包括但不限于：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>服务不会中断或无错误</li>
              <li>数据不会丢失或损坏</li>
              <li>服务能满足您的特定需求</li>
              <li>AI 输出的内容安全性和准确性</li>
            </ul>
            <p className="mt-2">在任何情况下，我们均不对因使用或无法使用本服务而产生的任何直接、间接、附带、特殊或后果性损害承担责任。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">七、赔偿</h2>
            <p>您同意赔偿并保护开发者免受因您违反本条款或侵犯他人权利而引起的任何索赔、损失、责任和费用（包括合理的律师费）。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">八、可分割性</h2>
            <p>如果本条款的任何部分被认定为无效或不可执行，其余部分仍具有完全效力。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1C1917]">九、联系方式</h2>
            <p className="text-[#B45309]">邮箱：legal@lifetimeline.app</p>
          </section>

          <div className="pt-6 border-t border-[#E7E5E4]">
            <Link href="/privacy" className="text-[#B45309] hover:underline text-sm">查看隐私政策 →</Link>
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