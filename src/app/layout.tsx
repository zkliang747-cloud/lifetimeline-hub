import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '人生时间轴 | 珍藏你的人生故事',
    template: '%s | 人生时间轴',
  },
  description:
    '人生时间轴 - 用文字和影像，记录你生命中的每一个重要瞬间，让岁月化作一条温暖的故事线。',
  keywords: [
    '时间轴',
    '人生记录',
    '日记',
    '回忆录',
    '生命故事',
    '个人网站',
  ],
  openGraph: {
    title: '人生时间轴 | 珍藏你的人生故事',
    description: '用文字和影像，记录你生命中的每一个重要瞬间',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}