/**
 * 时间轴分享海报生成器
 * 使用 Canvas API 生成可分享的图片
 */

interface PosterEntry {
  year: number;
  title: string;
  content?: string;
}

interface PosterOptions {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  entryCount: number;
  entries: PosterEntry[];
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = '';
  for (const char of text) {
    const testLine = currentLine + char;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generatePoster(options: PosterOptions): Promise<HTMLCanvasElement> {
  const { displayName, bio, entryCount, entries } = options;
  const width = 600;
  const height = Math.max(800, 400 + entries.length * 60);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#FAFAF5');
  gradient.addColorStop(0.5, '#FFF7ED');
  gradient.addColorStop(1, '#FAFAF5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative circle top-right
  ctx.fillStyle = '#FED7AA';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(width - 80, -40, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Title
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 28px "Noto Serif SC", serif';
  ctx.textAlign = 'center';
  ctx.fillText('📖 ' + displayName + ' 的时间轴', width / 2, 70);

  if (bio) {
    ctx.fillStyle = '#57534E';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(bio.length > 40 ? bio.slice(0, 40) + '...' : bio, width / 2, 100);
  }

  // Stats
  ctx.fillStyle = '#B45309';
  ctx.font = 'bold 13px "Inter", sans-serif';
  ctx.fillText(`共 ${entryCount} 条记忆记录`, width / 2, bio ? 130 : 120);

  // Separator
  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 150);
  ctx.lineTo(width - 100, 150);
  ctx.stroke();

  // Entries
  let yPos = 190;
  const displayEntries = entries.slice(0, 8);

  for (const entry of displayEntries) {
    // Year badge
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.roundRect(40, yPos - 2, 52, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(entry.year), 66, yPos + 9);

    // Title
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 14px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    const titleText = entry.title.length > 24 ? entry.title.slice(0, 24) + '...' : entry.title;
    ctx.fillText(titleText, 106, yPos + 2);

    // Content excerpt
    if (entry.content) {
      ctx.fillStyle = '#78716C';
      ctx.font = '12px "Inter", sans-serif';
      const preview = entry.content.length > 50 ? entry.content.slice(0, 50) + '...' : entry.content;
      ctx.fillText(preview, 106, yPos + 22);
      yPos += 48;
    } else {
      yPos += 32;
    }
  }

  if (entries.length > 8) {
    ctx.fillStyle = '#A8A29E';
    ctx.font = '12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`还有 ${entries.length - 8} 条记录...`, width / 2, yPos + 10);
    yPos += 30;
  }

  // Footer
  const footerY = Math.max(height - 80, yPos + 60);
  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(150, footerY);
  ctx.lineTo(width - 150, footerY);
  ctx.stroke();

  ctx.fillStyle = '#A8A29E';
  ctx.font = '11px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('用 人生时间轴 记录你的故事', width / 2, footerY + 30);

  return canvas;
}