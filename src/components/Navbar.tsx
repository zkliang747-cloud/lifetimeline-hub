'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-[#FAFAF5]/80 backdrop-blur-lg border-b border-[#E7E5E4]">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="text-lg">📖</span>
          <span className="font-serif font-bold text-[#1C1917]">人生时间轴</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/' 
                ? 'bg-[#1C1917] text-white' 
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            首页
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/dashboard' 
                ? 'bg-[#1C1917] text-white' 
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            时间轴
          </Link>
          <Link
            href="/settings"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/settings' 
                ? 'bg-[#1C1917] text-white' 
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            设置
          </Link>
          <form action="/api/auth/logout" method="POST" className="inline">
            <button
              type="submit"
              className="text-sm px-3 py-1.5 rounded-lg text-[#BE123C] hover:bg-[#FEF2F2] transition-colors"
            >
              退出
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}