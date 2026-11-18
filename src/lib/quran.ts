import { getCachedVerse, setCachedVerse, type ReciterEdition } from "./storage";
import {
  getScriptTextEdition,
  type ArabicFontId,
  type QuranScript,
} from "@/config/fonts";

export const BASMALA_UTHMANI = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

export interface FetchedAyah {
  globalNumber: number;
  surahNumber: number;
  ayahNumber: number;
  juz: number;
  surahNameAr: string;
  surahNameEn: string;
  surahNameEnTranslation: string;
  arabicText: string;
  basmalaHeader: string | null;
  urduText: string;
  englishText: string;
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface QuranIndex {
  surahs: SurahMeta[];
  ayahs: Record<string, { s: number; a: number; j: number }>;
}

interface EditionSurahFile {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  ayahs: Array<{
    number: number;
    numberInSurah: number;
    juz: number;
    text: string;
  }>;
}

let indexCache: QuranIndex | null = null;
const surahCache = new Map<string, EditionSurahFile>();

export function splitBasmala(
  rawText: string,
  surahNumber: number,
  ayahNumber: number
): { basmalaHeader: string | null; text: string } {
  const clean = rawText.replace(/^\uFEFF/, "").trim();
  if (surahNumber >= 2 && surahNumber !== 9 && ayahNumber === 1) {
    if (clean.startsWith(BASMALA_UTHMANI)) {
      const rest = clean.slice(BASMALA_UTHMANI.length).trim();
      return {
        basmalaHeader: BASMALA_UTHMANI,
        text: rest || clean,
      };
    }
  }
  return { basmalaHeader: null, text: clean };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function getQuranIndex(): Promise<QuranIndex> {
  if (indexCache) return indexCache;
  if (typeof window === "undefined") {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const p = path.resolve("public/data/quran/index.json");
    indexCache = JSON.parse(fs.readFileSync(p, "utf8")) as QuranIndex;
    return indexCache;
  }
  indexCache = await fetchJson<QuranIndex>("/data/quran/index.json");
  return indexCache;
}

async function loadSurahEdition(
  edition: string,
  surah: number
): Promise<EditionSurahFile> {
  const key = `${edition}:${surah}`;
  const hit = surahCache.get(key);
  if (hit) return hit;

  if (typeof window === "undefined") {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const p = path.resolve(`public/data/quran/${edition}/${surah}.json`);
    const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as EditionSurahFile;
    surahCache.set(key, parsed);
    return parsed;
  }

  const parsed = await fetchJson<EditionSurahFile>(
    `/data/quran/${edition}/${surah}.json`
  );
  surahCache.set(key, parsed);
  return parsed;
}

export async function getAyah(
  ref: number | string,
  script: QuranScript = "madani",
  arabicFont?: ArabicFontId
): Promise<FetchedAyah> {
  const arEdition = getScriptTextEdition(script, arabicFont);
  const cacheKey = `v4:${arEdition}:ref:${ref}`;
  if (typeof window !== "undefined") {
    const cached = await getCachedVerse<FetchedAyah>(cacheKey);
    if (cached) return cached;
  }

  try {
    let surahNum = 1;
    let ayahNum = 1;

    if (typeof ref === "number" || /^\d+$/.test(String(ref))) {
      const idx = await getQuranIndex();
      const mapping = idx.ayahs[String(ref)];
      if (!mapping) throw new Error(`Invalid global ayah ${ref}`);
      surahNum = mapping.s;
      ayahNum = mapping.a;
    } else {
      const [s, a] = String(ref).split(":").map(Number);
      if (!s || !a) throw new Error(`Invalid ayah ref ${ref}`);
      surahNum = s;
      ayahNum = a;
    }

    const [arSurah, urSurah, enSurah] = await Promise.all([
      loadSurahEdition(arEdition, surahNum),
      loadSurahEdition("ur.jalandhry", surahNum),
      loadSurahEdition("en.sahih", surahNum),
    ]);

    const ar = arSurah.ayahs[ayahNum - 1];
    const ur = urSurah.ayahs[ayahNum - 1];
    const en = enSurah.ayahs[ayahNum - 1];
    if (!ar || !ur || !en) {
      throw new Error(`Ayah ${surahNum}:${ayahNum} not found`);
    }

    const { basmalaHeader, text } = splitBasmala(ar.text, surahNum, ayahNum);
    const result: FetchedAyah = {
      globalNumber: ar.number,
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      juz: ar.juz,
      surahNameAr: arSurah.name,
      surahNameEn: arSurah.englishName,
      surahNameEnTranslation: arSurah.englishNameTranslation,
      arabicText: text,
      basmalaHeader,
      urduText: ur.text,
      englishText: en.text,
    };

    if (typeof window !== "undefined") {
      await setCachedVerse(`v4:${arEdition}:ref:${result.globalNumber}`, result);
      await setCachedVerse(`v4:${arEdition}:ref:${surahNum}:${ayahNum}`, result);
    }
    return result;
  } catch {
    // Fallback to live Al-Quran Cloud API
    const res = await fetchJson<{
      code: number;
      data: Array<{
        number: number;
        numberInSurah: number;
        juz: number;
        text: string;
        surah: {
          number: number;
          name: string;
          englishName: string;
          englishNameTranslation: string;
        };
      }>;
    }>(
      `https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,ur.jalandhry,en.sahih`
    );

    const [ar, ur, en] = res.data;
    const { basmalaHeader, text } = splitBasmala(
      ar.text,
      ar.surah.number,
      ar.numberInSurah
    );

    const result: FetchedAyah = {
      globalNumber: ar.number,
      surahNumber: ar.surah.number,
      ayahNumber: ar.numberInSurah,
      juz: ar.juz,
      surahNameAr: ar.surah.name,
      surahNameEn: ar.surah.englishName,
      surahNameEnTranslation: ar.surah.englishNameTranslation,
      arabicText: text,
      basmalaHeader,
      urduText: ur.text,
      englishText: en.text,
    };

    if (typeof window !== "undefined") {
      await setCachedVerse(`v3:ref:${result.globalNumber}`, result);
      await setCachedVerse(
        `v3:ref:${result.surahNumber}:${result.ayahNumber}`,
        result
      );
    }
    return result;
  }
}

export async function getAyahRange(
  surahNumber: number,
  startAyah: number,
  count: number,
  script: QuranScript = "madani",
  arabicFont?: ArabicFontId
): Promise<FetchedAyah[]> {
  const safeCount = Math.max(1, Math.min(5, count));
  const arEdition = getScriptTextEdition(script, arabicFont);
  const [arSurah, urSurah, enSurah] = await Promise.all([
    loadSurahEdition(arEdition, surahNumber),
    loadSurahEdition("ur.jalandhry", surahNumber),
    loadSurahEdition("en.sahih", surahNumber),
  ]);

  const out: FetchedAyah[] = [];
  for (let i = 0; i < safeCount; i++) {
    const idx = startAyah - 1 + i;
    const ar = arSurah.ayahs[idx];
    const ur = urSurah.ayahs[idx];
    const en = enSurah.ayahs[idx];
    if (!ar || !ur || !en) break;
    const { basmalaHeader, text } = splitBasmala(
      ar.text,
      surahNumber,
      ar.numberInSurah
    );
    out.push({
      globalNumber: ar.number,
      surahNumber,
      ayahNumber: ar.numberInSurah,
      juz: ar.juz,
      surahNameAr: arSurah.name,
      surahNameEn: arSurah.englishName,
      surahNameEnTranslation: arSurah.englishNameTranslation,
      arabicText: text,
      basmalaHeader,
      urduText: ur.text,
      englishText: en.text,
    });
  }
  return out;
}

export function getAudioCdnUrl(
  globalNumber: number,
  reciter: ReciterEdition
): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalNumber}.mp3`;
}

export function getAudioProxyUrl(
  globalNumber: number,
  reciter: ReciterEdition
): string {
  return `/api/audio?r=${encodeURIComponent(reciter)}&n=${globalNumber}`;
}
