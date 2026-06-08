'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TimelineForm from '@/components/TimelineForm';
import PDFExporter from '@/components/PDFExporter';
import AIPolishButton from '@/components/AIPolishButton';

interface TimelineEntry {
  id: string;
  user_id: string;
  year: number;
  title: string;
  content: string;
  tags: string[];
  is_public: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/entries', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setEntries(data);

      const userRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm('确定删除这条记录吗？')) return;

    const res = await fetch(`/api/entries/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      fetchEntries();
    } else {
      const data = await res.json();
      alert(data.error || '删除失败');
    }
  };

  const handleExportPDF = async () => {
    try {
      await fetch('/api/users/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PDF_EXPORT',
          amount: 5,
        }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('PDF export error:', error);
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-col sm:flex-row gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1C1917]">📝 我的时间轴</h1>
            <p className="text-[#57534E] text-sm mt-1">记录你生命中的每一个重要时刻</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {entries.length > 0 && (
              <PDFExporter
                entries={entries}
                username={user?.username || '用户'}
                onExport={handleExportPDF}
              />
            )}
            <button
              onClick={() => {
                setEditingEntry(null);
                setShowForm(true);
              }}
              className="px-5 py-2.5 bg-[#B45309] text-white rounded-xl text-sm font-medium hover:bg-[#92400E] transition-colors shadow-sm flex-1 sm:flex-none min-h-[44px]"
            >
              ✚ 新建节点
            </button>
          </div>
        </div>

        {showForm && (
          <div
            className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-[#1C1917]">
                  {editingEntry ? '编辑节点' : '新建节点'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#A8A29E] hover:text-[#1C1917] transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
              <TimelineForm
                entry={editingEntry}
                onSuccess={() => {
                  setShowForm(false);
                  fetchEntries();
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-[#57534E]">还没有记录</p>
            <p className="text-[#A8A29E] text-sm mt-1">点击上方「新建节点」开始创建你的时间轴</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-serif text-lg font-bold text-[#B45309]">{entry.year}</span>
                      <span className="text-[#1C1917] font-medium truncate">{entry.title}</span>
                      {!entry.is_public && (
                        <span className="text-xs bg-[#F5F5F4] text-[#A8A29E] px-2 py-0.5 rounded-full">私密</span>
                      )}
                    </div>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {entry.tags.map(tag => (
                          <span key={tag} className="text-xs bg-[#FFFBEB] text-[#B45309] px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {entry.content && (
                      <p className="text-sm text-[#57534E] line-clamp-2 leading-relaxed">{entry.content}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingEntry(entry);
                        setShowForm(true);
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#E7E5E4] text-[#57534E] hover:bg-[#FAFAF5] transition-colors min-h-[44px] sm:min-h-auto"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id, entry.image_url)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#FEE2E2] text-[#BE123C] hover:bg-[#FEF2F2] transition-colors min-h-[44px] sm:min-h-auto"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {entry.image_url && (
                  <img
                    src={entry.image_url}
                    alt={entry.title}
                    className="mt-3 rounded-xl max-h-48 w-full object-cover"
                  />
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F5F4]">
                  <span className="text-xs text-[#A8A29E]">
                    {new Date(entry.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <AIPolishButton
                    text={entry.content}
                    onPolish={(polished) => {
                      navigator.clipboard.writeText(polished);
                      alert('✨ 润色结果已复制到剪贴板，可粘贴替换正文');
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}