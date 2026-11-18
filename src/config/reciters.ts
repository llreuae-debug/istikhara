export type ReciterId =
  | "ar.alafasy"
  | "ar.abdulbasitmurattal"
  | "ar.husary";

export interface ReciterConfig {
  id: ReciterId;
  qdcId: number;
  nameEn: string;
  nameUr: string;
  wordTimed: boolean;
  timingSource: string;
  everyAyahDir: string;
  qdcChapterBaseUrl: string;
}

export const RECITERS: ReciterConfig[] = [
  {
    id: "ar.alafasy",
    qdcId: 7,
    nameEn: "Mishary Rashid Alafasy",
    nameUr: "مشاري راشد العفاسي",
    wordTimed: true,
    timingSource: "QUL / Quran.com QDC Segments (qdcId=7)",
    everyAyahDir: "Alafasy_128kbps",
    qdcChapterBaseUrl: "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal",
  },
  {
    id: "ar.abdulbasitmurattal",
    qdcId: 2,
    nameEn: "Abdul Basit (Murattal)",
    nameUr: "عبد الباسط عبد الصمد",
    wordTimed: true,
    timingSource: "QUL / Quran.com QDC Segments (qdcId=2)",
    everyAyahDir: "Abdul_Basit_Murattal_192kbps",
    qdcChapterBaseUrl: "https://download.quranicaudio.com/qdc/abdul_baset/murattal",
  },
  {
    id: "ar.husary",
    qdcId: 6,
    nameEn: "Mahmoud Khalil Al-Husary",
    nameUr: "محمود خليل الحصري",
    wordTimed: true,
    timingSource: "QUL / Quran.com QDC Segments (qdcId=6)",
    everyAyahDir: "Husary_128kbps",
    qdcChapterBaseUrl: "https://download.quranicaudio.com/qdc/khalil_al_husary/murattal",
  },
];

export function getReciterConfig(id: ReciterId): ReciterConfig {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

export function getReciterName(id: ReciterId, lang: "ur" | "en"): string {
  const found = getReciterConfig(id);
  return lang === "ur" ? found.nameUr : found.nameEn;
}

export function getEveryAyahUrl(
  id: ReciterId,
  surah: number,
  ayah: number
): string {
  const cfg = getReciterConfig(id);
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${cfg.everyAyahDir}/${s}${a}.mp3`;
}
