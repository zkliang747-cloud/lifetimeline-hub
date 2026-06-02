'use client';

import { useState, useRef } from 'react';

interface Props {
  onUpload: (url: string) => void;
  initialUrl?: string;
}

export default function ImageUploader({ onUpload, initialUrl }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 免费用户限制
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 免费用户 2MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 类型校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('仅支持 JPG / PNG / WebP / GIF 格式');
      return;
    }

    // 大小校验（免费用户上限 2MB）
    if (file.size > MAX_FILE_SIZE) {
      alert('图片大小不能超过 2MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
      } else {
        alert(data.error || '上传失败');
      }
    } catch {
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      {preview && (
        <div className="relative mb-2 inline-block">
          <img src={preview} alt="预览" className="rounded-xl max-h-32 object-cover" />
          <button
            type="button"
            onClick={() => { setPreview(''); onUpload(''); }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#BE123C] text-white text-xs flex items-center justify-center hover:bg-[#9F1239] transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#E7E5E4] text-sm text-[#57534E] hover:border-[#B45309] hover:text-[#B45309] transition-colors cursor-pointer">
        <span>{uploading ? '⏳ 上传中...' : '📷 选择图片'}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}