import type { QuranScript } from "@/config/fonts";

export type LanguageMode = "ur" | "en" | "both";
export type ThemeMode = "dark" | "light" | "auto";
export type ReciterEdition = "ar.alafasy" | "ar.abdulbasitmurattal" | "ar.husary";
export type SelectionMode = "full" | "reflection";
export type IntentionCategory =
  | "marriage"
  | "business"
  | "job"
  | "travel"
  | "study"
  | "property"
  | "other";

export interface AppSettings {
  language: LanguageMode;
  theme: ThemeMode;
  arabicFontSize: number;
  script: QuranScript;
  reciter: ReciterEdition;
  selectionMode: SelectionMode;
  haptics: boolean;
  animations: boolean;
  hijriOffset: -1 | 0 | 1;
  offlineDownloaded: boolean;
  completedCount: number;
}

export interface IntentionDraft {
  category: IntentionCategory;
  note: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  surah: number;
  ayah: number;
  globalNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  category: IntentionCategory;
  note?: string;
  saved: boolean;
  journalNote?: string;
  firstLineUr: string;
  firstLineEn: string;
}

const SETTINGS_KEY = "istikhara:settings:v1";
const INTENTION_KEY = "istikhara:intention:v1";
const HISTORY_KEY = "istikhara:history:v1";

export const DEFAULT_SETTINGS: AppSettings = {
  language: "ur",
  theme: "dark",
  arabicFontSize: 30,
  script: "indopak",
  reciter: "ar.alafasy",
  selectionMode: "full",
  haptics: true,
  animations: true,
  hijriOffset: 0,
  offlineDownloaded: false,
  completedCount: 0,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage quota errors
  }
}

export function loadIntention(): IntentionDraft {
  try {
    const raw = localStorage.getItem(INTENTION_KEY);
    if (!raw) return { category: "other", note: "" };
    return JSON.parse(raw) as IntentionDraft;
  } catch {
    return { category: "other", note: "" };
  }
}

export function saveIntention(draft: IntentionDraft): void {
  try {
    localStorage.setItem(INTENTION_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function addHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const existing = loadHistory();
  const next = [entry, ...existing];
  saveHistory(next);
  return next;
}

export function updateHistoryEntry(
  id: string,
  patch: Partial<HistoryEntry>
): HistoryEntry[] {
  const next = loadHistory().map((item) =>
    item.id === id ? { ...item, ...patch } : item
  );
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

/* -------------------------------------------------------------------------- */
/*  IndexedDB for Offline Verse Cache (50+ recent & optional full Quran)      */
/* -------------------------------------------------------------------------- */

const DB_NAME = "istikhara-quran-db";
const DB_VERSION = 1;
const STORE_NAME = "verses";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedVerse<T>(key: string): Promise<T | null> {
  try {
    const db = await openDb();
    return await new Promise<T | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? (req.result.value as T) : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedVerse<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ key, value, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

export async function bulkCacheVerses(
  records: Array<{ key: string; value: unknown }>
): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const now = Date.now();
      for (const r of records) {
        store.put({ key: r.key, value: r.value, updatedAt: now });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}
