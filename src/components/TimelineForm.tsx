'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';

interface Props {
  entry?: {
    id: string;
    year: number;
    title: string;
    content: string;
    tags: string[];
    is_public: boolean;
    image_url: string | null;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TimelineForm({ entry, onSuccess, onCancel }: Props) {
  const [year, setYear] = useState(entry?.year || new Date().getFullYear());
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [tags, setTags] = useState(entry?.tags?.join(', ') || '');
  const [isPublic, setIsPublic] = useState(entry?.is_public ?? true);
  const [imageUrl, setImageUrl] = useState(entry?.image_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        year: Number(year),
        title,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        is_public: isPublic,
        image_url: imageUrl || null,
      };

      let res;
      if (entry?.id) {
        res = await fetch(`/api/entries/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      } else {
        res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '保存失败');
        return;
      }

      onSuccess();
    } catch {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-1">年份</label>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
          required
          min={1900}
          max={2099}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
          placeholder="给这个时刻起个名字..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-1">正文</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={5}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all resize-none"
          placeholder="写下你的回忆、感悟、故事..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-1">标签（逗号分隔）</label>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all"
          placeholder="例如: 旅行,职场,家庭"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-1">图片</label>
        <ImageUploader onUpload={(url) => setImageUrl(url)} initialUrl={imageUrl} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
          className="rounded border-[#E7E5E4] text-[#B45309] focus:ring-[#B45309]/20"
        />
        <span className="text-sm text-[#57534E]">公开此节点（所有人可见）</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-[#B45309] text-white text-sm font-medium hover:bg-[#92400E] transition-colors disabled:opacity-50"
        >
          {loading ? '保存中...' : entry ? '更新记录' : '创建记录'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-[#E7E5E4] text-[#57534E] text-sm font-medium hover:bg-[#FAFAF5] transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}