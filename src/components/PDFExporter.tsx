'use client';

import { useState } from 'react';
import { Download, Loader } from 'lucide-react';

interface TimelineEntry {
  id: string;
  year: number;
  title: string;
  content: string;
  tags: string[];
  image_url?: string;
  created_at: string;
}

interface Props {
  entries: TimelineEntry[];
  username: string;
  onExport?: () => void;
}

export default function PDFExporter({ entries, username, onExport }: Props) {
  const [exporting, setExporting] = useState(false);

  const generatePDF = async () => {
    if (exporting || entries.length === 0) return;

    setExporting(true);
    try {
      const jsPDFModule = await import('jspdf');
      const { jsPDF } = jsPDFModule;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setFontSize(20);
      pdf.text('📖 人生时间轴', 105, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.text(`用户：${username}`, 105, 30, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(
        `导出时间：${new Date().toLocaleDateString('zh-CN')}`,
        105,
        37,
        { align: 'center' }
      );

      let yPosition = 45;

      for (const entry of entries) {
        if (yPosition > 260) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setTextColor(180, 83, 9);
        pdf.setFontSize(14);
        pdf.text(`${entry.year} - ${entry.title}`, 20, yPosition);
        yPosition += 8;

        if (entry.tags && entry.tags.length > 0) {
          pdf.setTextColor(100);
          pdf.setFontSize(9);
          const tagsText = entry.tags.join(' | ');
          pdf.text(tagsText, 20, yPosition);
          yPosition += 5;
        }

        pdf.setTextColor(0);
        pdf.setFontSize(10);

        if (entry.content) {
          const lines = pdf.splitTextToSize(entry.content, 170);
          pdf.text(lines, 20, yPosition);
          yPosition += lines.length * 5 + 3;
        }

        if (entry.image_url) {
          try {
            if (yPosition > 240) {
              pdf.addPage();
              yPosition = 20;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve) => {
              img.onload = () => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');

                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const imgData = canvas.toDataURL('image/jpeg', 0.8);

                    const imgHeight = Math.min(40, 50);
                    const imgWidth = (imgHeight * img.width) / img.height;
                    const imgX = (210 - imgWidth) / 2;

                    pdf.addImage(
                      imgData,
                      'JPEG',
                      imgX,
                      yPosition,
                      imgWidth,
                      imgHeight
                    );

                    yPosition += 45;
                  }
                  resolve(null);
                } catch (error) {
                  console.error('Image processing error:', error);
                  resolve(null);
                }
              };
              img.onerror = () => {
                console.error('Image load error:', entry.image_url);
                resolve(null);
              };
              img.src = entry.image_url || '';
            });
          } catch (error) {
            console.error('Image handling error:', error);
          }
        }

        pdf.setDrawColor(200);
        yPosition += 3;
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 5;
      }

      const pageCount = (pdf as any).internal.pages.length - 1;
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `第 ${i} 页，共 ${pageCount} 页`,
          105,
          285,
          { align: 'center' }
        );
      }

      const fileName = `人生时间轴_${username}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      onExport?.();
    } catch (error) {
      console.error('PDF 导出失败:', error);
      alert('导出失败，请重试。');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={exporting || entries.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#B45309] text-white text-sm font-medium hover:bg-[#92400E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-auto"
      title={entries.length === 0 ? '没有记录可导出' : '导出为 PDF 文件'}
    >
      {exporting ? (
        <>
          <Loader size={16} className="animate-spin" />
          生成中...
        </>
      ) : (
        <>
          <Download size={16} />
          PDF 导出
        </>
      )}
    </button>
  );
}