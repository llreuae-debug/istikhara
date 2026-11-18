import type { ReciterId } from "@/config/reciters";

/**
 * Word timing tuple: [wordIndex (0-based), startMs (rel to ayah start), endMs]
 */
export type WordTimingTuple = [number, number, number];

export interface AyahTimingEntry {
  ayah: number;
  fromMs: number;
  toMs: number;
  words: WordTimingTuple[];
}

export interface SurahTimingsFile {
  reciter: ReciterId;
  surah: number;
  audioUrl: string;
  ayahs: AyahTimingEntry[];
}

export interface ResolvedWordTimings {
  tokens: string[];
  meaningsUr: string[];
  words: WordTimingTuple[];
  approximate: boolean;
  fromMs: number;
  toMs: number;
}

// Standalone Quranic waqf/pause marks & small annotations that attach to preceding word
const STANDALONE_WAQF_RE =
  /^[\u06D6-\u06ED\u06DE\u06E9\u0615-\u061A\u200C-\u200F\sۖۗۘۙۚۛۜ۞۩]+$/;

/**
 * Tokenizes Arabic Quranic text into recitation words, attaching standalone
 * waqf/pause marks (ۖ, ۗ, ۘ, ۙ, ۚ, ۛ, ۜ, ۩, etc.) to the preceding word.
 */
export function tokenizeQuranWords(arabicText: string): string[] {
  const raw = arabicText.trim().split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  for (const part of raw) {
    // Skip standalone ayah-end markers if present
    if (/^﴿?\d+﴾?$/.test(part) || /^[\u0660-\u0669]+$/.test(part)) {
      continue;
    }
    if (STANDALONE_WAQF_RE.test(part) && tokens.length > 0) {
      tokens[tokens.length - 1] = `${tokens[tokens.length - 1]} ${part}`;
    } else {
      tokens.push(part);
    }
  }
  return tokens;
}

/**
 * Builds proportional timings per word based on character length within [0, durationMs].
 */
export function buildProportionalWordTimings(
  tokens: string[],
  durationMs: number
): WordTimingTuple[] {
  if (tokens.length === 0) return [];
  const safeDur = Math.max(400, durationMs);
  const weights = tokens.map((t) => Math.max(2, t.replace(/\s+/g, "").length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cursor = 0;
  return tokens.map((_, idx) => {
    const start = Math.round(cursor);
    const share = (weights[idx] / totalWeight) * safeDur;
    cursor += share;
    const end =
      idx === tokens.length - 1 ? Math.round(safeDur) : Math.round(cursor);
    return [idx, start, Math.max(start + 1, end)];
  });
}

const timingsCache = new Map<string, SurahTimingsFile | null>();
const wordsUrCache = new Map<number, Record<string, string[]> | null>();

export async function loadSurahTimings(
  reciter: ReciterId,
  surah: number
): Promise<SurahTimingsFile | null> {
  const key = `${reciter}:${surah}`;
  if (timingsCache.has(key)) return timingsCache.get(key) ?? null;

  try {
    if (typeof window === "undefined" || import.meta.env?.VITEST) {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const p = path.resolve(`public/data/timings/${reciter}/${surah}.json`);
      if (!fs.existsSync(p)) {
        timingsCache.set(key, null);
        return null;
      }
      const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as SurahTimingsFile;
      timingsCache.set(key, parsed);
      return parsed;
    }

    const res = await fetch(`/data/timings/${reciter}/${surah}.json`);
    if (!res.ok) {
      timingsCache.set(key, null);
      return null;
    }
    const parsed = (await res.json()) as SurahTimingsFile;
    timingsCache.set(key, parsed);
    return parsed;
  } catch {
    timingsCache.set(key, null);
    return null;
  }
}

export async function loadSurahWordsUr(
  surah: number
): Promise<Record<string, string[]> | null> {
  if (wordsUrCache.has(surah)) return wordsUrCache.get(surah) ?? null;

  try {
    if (typeof window === "undefined" || import.meta.env?.VITEST) {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const p = path.resolve(`public/data/words-ur/${surah}.json`);
      if (!fs.existsSync(p)) {
        wordsUrCache.set(surah, null);
        return null;
      }
      const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as Record<
        string,
        string[]
      >;
      wordsUrCache.set(surah, parsed);
      return parsed;
    }

    const res = await fetch(`/data/words-ur/${surah}.json`);
    if (!res.ok) {
      wordsUrCache.set(surah, null);
      return null;
    }
    const parsed = (await res.json()) as Record<string, string[]>;
    wordsUrCache.set(surah, parsed);
    return parsed;
  } catch {
    wordsUrCache.set(surah, null);
    return null;
  }
}

/**
 * Resolves exact word timings for an ayah, falling back gracefully to
 * proportional timing if the reciter lacks timing data or token counts mismatch.
 */
export function resolveAyahWordTimings(
  arabicText: string,
  durationMs: number,
  timingEntry?: AyahTimingEntry | null,
  meaningsUr: string[] = []
): ResolvedWordTimings {
  const tokens = tokenizeQuranWords(arabicText);
  if (
    timingEntry &&
    timingEntry.words.length === tokens.length &&
    tokens.length > 0
  ) {
    return {
      tokens,
      meaningsUr,
      words: timingEntry.words,
      approximate: false,
      fromMs: timingEntry.fromMs,
      toMs: timingEntry.toMs,
    };
  }

  return {
    tokens,
    meaningsUr,
    words: buildProportionalWordTimings(tokens, durationMs),
    approximate: true,
    fromMs: timingEntry?.fromMs ?? 0,
    toMs: timingEntry?.toMs ?? durationMs,
  };
}

/**
 * Returns the 0-based active word index at `relMs` (ms since ayah start).
 * Returns -1 before the first word starts, or the last completed index during gaps.
 */
export function getActiveWordIndex(
  words: WordTimingTuple[],
  relMs: number
): number {
  if (words.length === 0) return -1;
  if (relMs < words[0][1]) return 0;
  for (let i = 0; i < words.length; i++) {
    const [, start, end] = words[i];
    if (relMs >= start && relMs <= end) return i;
    if (relMs < start) return Math.max(0, i - 1);
  }
  return words.length - 1;
}
