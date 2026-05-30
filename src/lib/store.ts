import crypto from 'crypto';

const DATA_DIR = '/tmp/timeline-data';
const ENTRIES_FILE = `${DATA_DIR}/entries.json`;

// ===== Entry Types =====
export interface TimelineEntry {
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

// ===== Read/Write Helpers =====
async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

async function writeJSON(filePath: string, data: unknown) {
  const fs = await import('fs/promises');
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===== CRUD Operations =====
export async function getAllEntries(userId: string): Promise<TimelineEntry[]> {
  const entries = await readJSON<TimelineEntry[]>(ENTRIES_FILE, []);
  return entries
    .filter(e => e.user_id === userId)
    .sort((a, b) => b.year - a.year || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPublicEntries(userId: string): Promise<TimelineEntry[]> {
  const entries = await readJSON<TimelineEntry[]>(ENTRIES_FILE, []);
  return entries
    .filter(e => e.user_id === userId && e.is_public)
    .sort((a, b) => a.year - b.year || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function createEntry(data: Omit<TimelineEntry, 'id' | 'created_at' | 'updated_at'>): Promise<TimelineEntry> {
  const entries = await readJSON<TimelineEntry[]>(ENTRIES_FILE, []);
  const now = new Date().toISOString();
  const entry: TimelineEntry = {
    ...data,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  entries.push(entry);
  await writeJSON(ENTRIES_FILE, entries);
  return entry;
}

export async function updateEntry(id: string, userId: string, data: Partial<TimelineEntry>): Promise<TimelineEntry | null> {
  const entries = await readJSON<TimelineEntry[]>(ENTRIES_FILE, []);
  const idx = entries.findIndex(e => e.id === id && e.user_id === userId);
  if (idx === -1) return null;
  
  entries[idx] = {
    ...entries[idx],
    ...data,
    id: entries[idx].id,
    user_id: entries[idx].user_id,
    created_at: entries[idx].created_at,
    updated_at: new Date().toISOString(),
  };
  await writeJSON(ENTRIES_FILE, entries);
  return entries[idx];
}

export async function deleteEntry(id: string, userId: string): Promise<boolean> {
  const entries = await readJSON<TimelineEntry[]>(ENTRIES_FILE, []);
  const idx = entries.findIndex(e => e.id === id && e.user_id === userId);
  if (idx === -1) return false;
  
  const deleted = entries.splice(idx, 1);
  await writeJSON(ENTRIES_FILE, entries);
  return deleted.length > 0;
}

// ===== Year/Aggregation Helpers =====
export function getYearsFromEntries(entries: TimelineEntry[]): number[] {
  return [...new Set(entries.map(e => e.year))].sort((a, b) => b - a);
}

export function groupEntriesByYear(entries: TimelineEntry[]): Record<number, TimelineEntry[]> {
  const groups: Record<number, TimelineEntry[]> = {};
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