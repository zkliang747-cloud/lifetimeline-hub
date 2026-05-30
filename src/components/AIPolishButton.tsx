'use client';

import { useState } from 'react';

interface Props {
  text: string;
  onPolish: (polished: string) => void;
}

export default function AIPolishButton({ text, onPolish }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePolish = async () => {
    if (!text || text.trim().length < 10) {
      alert('文本太短（至少10个字符），无法润色');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        credentials: 'include',
      });

      const data = await res.json();
      if (data.polished) {
        onPolish(data.polished);
      } else {
        alert(data.error || '润色失败');
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePolish}
      disabled={loading}
      className="text-xs text-[#B45309] hover:text-[#92400E] transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      {loading ? (
        <>⏳ 润色中...</>
      ) : (
        <>✨ AI润色</>
      )}
    </button>
  );
}