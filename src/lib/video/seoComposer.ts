import type { FetchedAyah } from "@/lib/quran";
import type { VideoMode } from "./timeline";

export interface VideoSeoPackage {
  title: string;
  description: string;
  hashtags: string[];
  keywords: string[];
  fullCaption: string;
}

export function buildVideoSeo(params: {
  ayahs: FetchedAyah[];
  reciterNameUr: string;
  reciterNameEn: string;
  mode: VideoMode;
  tafsirNameUr?: string;
  voiceCreditUr?: string;
  shareUrl: string;
  captionLimit: number;
}): VideoSeoPackage {
  const {
    ayahs,
    reciterNameUr,
    reciterNameEn,
    mode,
    tafsirNameUr,
    voiceCreditUr,
    shareUrl,
    captionLimit,
  } = params;

  const primary = ayahs[0];
  if (!primary) {
    return { title: "", description: "", hashtags: [], keywords: [], fullCaption: "" };
  }

  const last = ayahs[ayahs.length - 1];
  const ref =
    ayahs.length > 1
      ? `${primary.surahNumber}:${primary.ayahNumber}-${last.ayahNumber}`
      : `${primary.surahNumber}:${primary.ayahNumber}`;
  const safeSurahTag = primary.surahNameEn.replace(/[^a-zA-Z0-9]/g, "");
  const safeReciterTag = reciterNameEn.replace(/[^a-zA-Z0-9]/g, "");

  const modeLabelEn =
    mode === "urdu-tarjuma" ? "Urdu Translation" : "Urdu Tafseer";
  const rawTitle = `Surah ${primary.surahNameEn} (${ref}) | ${primary.surahNameAr} — ${reciterNameEn} | Quran ${modeLabelEn}`;
  const title = rawTitle.length > 100 ? rawTitle.slice(0, 97).trimEnd() + "…" : rawTitle;

  const hashtags = [
    "#Quran",
    `#Surah${safeSurahTag || primary.surahNumber}`,
    "#QuranUrduTranslation",
    "#IslamicShorts",
    `#${safeReciterTag || "QuranRecitation"}`,
  ];

  const keywords = [
    `Surah ${primary.surahNameEn}`,
    `Surah ${primary.surahNameEn} ${ref}`,
    `${primary.surahNameAr} ${ref}`,
    `Surah ${primary.surahNumber} Ayah ${primary.ayahNumber}`,
    `Quran ${ref}`,
    `${primary.surahNameEn} Urdu translation`,
    `${primary.surahNameEn} recitation`,
    `${reciterNameEn} Quran`,
    `${reciterNameUr}`,
    "Quran with Urdu translation",
    "Quran Urdu tarjuma",
    "Quran Urdu tafseer",
    "Quran shorts",
    "Islamic shorts",
    "Quran status",
    "Quran WhatsApp status",
    "Quran reels",
    "Tilawat e Quran",
    "Heart touching Quran recitation",
    "Peaceful Quran recitation",
    "Quran reflection",
    "Tadabbur",
    "Istikhara",
    "Daily Quran verse",
    "Beautiful Quran recitation",
  ];

  const excerptUr = ayahs
    .map((a) => a.urduText)
    .join(" ")
    .slice(0, 260)
    .trim();
  const excerptEn = ayahs
    .map((a) => a.englishText)
    .join(" ")
    .slice(0, 220)
    .trim();

  const credits = [
    `🎙 تلاوت / Reciter: ${reciterNameUr} (${reciterNameEn})`,
    mode !== "urdu-tarjuma" && tafsirNameUr ? `📚 تفسیر: ${tafsirNameUr}` : null,
    voiceCreditUr ? `🔊 ${voiceCreditUr}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const descriptionLines = [
    `📖 ${primary.surahNameAr} — Surah ${primary.surahNameEn} (${ref})`,
    "",
    excerptUr,
    excerptEn,
    "",
    credits,
    "یہ آیت غور و فکر کے لیے ہے۔ مسنون استخارہ دو رکعت نماز اور دعا ہے۔",
    `🔗 ${shareUrl}`,
  ];
  const description = descriptionLines.join("\n");

  const combined = `${title}\n\n${description}\n\n${hashtags.join(" ")}`;
  const fullCaption =
    combined.length > captionLimit
      ? `${title}\n\n${excerptUr.slice(0, 110)}…\n${credits}\n🔗 ${shareUrl}\n${hashtags.join(" ")}`.slice(
          0,
          captionLimit
        )
      : combined;

  return {
    title,
    description,
    hashtags,
    keywords,
    fullCaption,
  };
}
