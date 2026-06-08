'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
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
  const [imageError, setImageError] = useState('');

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

  const yearOptions = Array.from({ length: 151 }, (_, i) => 2050 - i);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 改进的年份选择器 */}
      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-2">年份</label>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all appearance-none cursor-pointer sm:min-h-[44px]"
          required
        >
          {yearOptions.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* 标题 */}
      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-2">标题</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all sm:min-h-[44px]"
          placeholder="给这个时刻起个名字..."
          required
        />
      </div>

      {/* 正文 */}
      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-2">正文</label>
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all resize-none"
            placeholder="写下你的回忆、感悟、故事..."
          />
          <button
            type="button"
            onClick={async () => {
              if (content.trim().length < 10) {
                alert('正文至少10个字符才能润色');
                return;
              }
              try {
                const res = await fetch('/api/ai/polish', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: content }),
                  credentials: 'include',
                });
                const data = await res.json();
                if (data.polished) {
                  setContent(data.polished);
                } else {
                  alert(data.error || '润色失败');
                }
              } catch {
                alert('网络错误');
              }
            }}
            className="absolute bottom-2 right-2 px-3 py-1.5 text-xs rounded-lg bg-[#B45309]/10 text-[#B45309] hover:bg-[#B45309]/20 transition-colors flex items-center gap-1"
          >
            ✨ AI润色
          </button>
        </div>
        <p className="text-[10px] text-[#A8A29E] mt-1">免费用户每日限3次 · 至少10个字符</p>
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-[#57534E] mb-2">标签（逗号分隔）</label>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 focus:border-[#B45309] transition-all sm:min-h-[44px]"
          placeholder="例如: 旅行,职场,家庭"
        />
      </div>

      {/* 改进的图片上传区域 */}
      <div className="p-4 rounded-xl border-2 border-dashed border-[#E7E5E4] bg-[#FAFAF5] hover:border-[#B45309]/50 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Upload size={18} className="text-[#B45309]" />
          <label className="block text-sm font-medium text-[#57534E]">图片（可选）</label>
        </div>
        <p className="text-xs text-[#A8A29E] mb-3">支持 JPG / PNG / WebP，最大 2MB</p>

        <ImageUploader
          onUpload={(url) => {
            setImageUrl(url);
            setImageError('');
          }}
          initialUrl={imageUrl}
        />

        {/* 图片预览 */}
        {imageUrl && (
          <div className="mt-3 relative inline-block">
            <img
              src={imageUrl}
              alt="预览"
              className="rounded-lg max-w-full max-h-32 object-cover border border-[#E7E5E4]"
              onError={() => setImageError('图片加载失败')}
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setImageError('');
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#BE123C] text-white text-xs flex items-center justify-center hover:bg-[#9F1239] transition-colors shadow-md"
              title="删除图片"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {imageError && <p className="text-xs text-[#BE123C] mt-2">❌ {imageError}</p>}
      </div>

      {/* 隐私设置 */}
      <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-[#FAFAF5] transition-colors">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
          className="rounded border-[#E7E5E4] text-[#B45309] focus:ring-[#B45309]/20"
        />
        <span className="text-sm text-[#57534E]">公开此节点（所有人可见）</span>
      </label>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-[#B45309] text-white text-sm font-medium hover:bg-[#92400E] transition-colors disabled:opacity-50 min-h-[44px]"
        >
          {loading ? '保存中...' : entry ? '更新记录' : '创建记录'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-[#E7E5E4] text-[#57534E] text-sm font-medium hover:bg-[#FAFAF5] transition-colors min-h-[44px]"
        >
          取消
        </button>
      </div>
    </form>
  );
}