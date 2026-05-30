import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getYearsFromEntries(entries: { year: number }[]): number[] {
  return [...new Set(entries.map(e => e.year))].sort((a, b) => b - a);
}

export function groupEntriesByYear<T extends { year: number; created_at: string }>(entries: T[]): Record<number, T[]> {
  const groups: Record<number, T[]> = {};
  entries.forEach(entry => {
    if (!groups[entry.year]) groups[entry.year] = [];
    groups[entry.year].push(entry);
  });
  Object.keys(groups).forEach(year => {
    groups[Number(year)].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });
  return groups;
}
