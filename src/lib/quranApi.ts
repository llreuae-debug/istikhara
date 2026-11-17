import {
  bulkCacheVerses,
  getCachedVerse,
  setCachedVerse,
  type ReciterEdition,
} from "./storage";

export interface FetchedAyah {
  globalNumber: number;
  surahNumber: number;
  ayahNumber: number;
  juz: number;
  surahNameAr: string;
  surahNameEn: string;
  surahNameEnTranslation: string;
  arabicText: string;
  urduText: string;
  englishText: string;
}

const BASE_URL = "https://api.alquran.cloud/v1";

async function fetchWithBackoff(url: string, retries = 3): Promise<Response> {
  let delay = 500;
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Network error");
}

export async function fetchAyahByRef(ref: string | number): Promise<FetchedAyah> {
  const cacheKey = `ref:${ref}`;
  const cached = await getCachedVerse<FetchedAyah>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/ayah/${ref}/editions/quran-uthmani,ur.jalandhry,en.sahih`;
  const res = await fetchWithBackoff(url);
  const json = await res.json();

  if (json.code !== 200 || !Array.isArray(json.data) || json.data.length < 3) {
    throw new Error("Invalid response from Al-Quran Cloud API");
  }

  const [ar, ur, en] = json.data;
  const ayah: FetchedAyah = {
    globalNumber: ar.number,
    surahNumber: ar.surah.number,
    ayahNumber: ar.numberInSurah,
    juz: ar.juz,
    surahNameAr: ar.surah.name,
    surahNameEn: ar.surah.englishName,
    surahNameEnTranslation: ar.surah.englishNameTranslation,
    arabicText: ar.text,
    urduText: ur.text,
    englishText: en.text,
  };

  await setCachedVerse(`ref:${ayah.globalNumber}`, ayah);
  await setCachedVerse(`ref:${ayah.surahNumber}:${ayah.ayahNumber}`, ayah);
  return ayah;
}

export async function fetchAyahAudioUrl(
  globalNumber: number,
  reciter: ReciterEdition
): Promise<string> {
  const url = `${BASE_URL}/ayah/${globalNumber}/${reciter}`;
  const res = await fetchWithBackoff(url, 2);
  const json = await res.json();
  if (json.code === 200 && json.data?.audio) {
    return json.data.audio as string;
  }
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalNumber}.mp3`;
}

export async function downloadFullQuranOffline(
  onProgress?: (pct: number) => void
): Promise<void> {
  onProgress?.(10);
  const [arRes, urRes, enRes] = await Promise.all([
    fetchWithBackoff(`${BASE_URL}/quran/quran-uthmani`),
    fetchWithBackoff(`${BASE_URL}/quran/ur.jalandhry`),
    fetchWithBackoff(`${BASE_URL}/quran/en.sahih`),
  ]);
  onProgress?.(55);

  const [arJson, urJson, enJson] = await Promise.all([
    arRes.json(),
    urRes.json(),
    enRes.json(),
  ]);
  onProgress?.(75);

  const arSurahs = arJson.data.surahs;
  const urSurahs = urJson.data.surahs;
  const enSurahs = enJson.data.surahs;

  const records: Array<{ key: string; value: FetchedAyah }> = [];
  for (let s = 0; s < arSurahs.length; s++) {
    const arSurah = arSurahs[s];
    const urSurah = urSurahs[s];
    const enSurah = enSurahs[s];
    for (let a = 0; a < arSurah.ayahs.length; a++) {
      const arAyah = arSurah.ayahs[a];
      const urAyah = urSurah.ayahs[a];
      const enAyah = enSurah.ayahs[a];
      const value: FetchedAyah = {
        globalNumber: arAyah.number,
        surahNumber: arSurah.number,
        ayahNumber: arAyah.numberInSurah,
        juz: arAyah.juz,
        surahNameAr: arSurah.name,
        surahNameEn: arSurah.englishName,
        surahNameEnTranslation: arSurah.englishNameTranslation,
        arabicText: arAyah.text,
        urduText: urAyah.text,
        englishText: enAyah.text,
      };
      records.push({ key: `ref:${value.globalNumber}`, value });
      records.push({
        key: `ref:${value.surahNumber}:${value.ayahNumber}`,
        value,
      });
    }
  }

  await bulkCacheVerses(records);
  onProgress?.(100);
}
