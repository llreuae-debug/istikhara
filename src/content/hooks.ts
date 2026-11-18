export interface HookPreset {
  id: string;
  ur: string;
  en: string;
}

export const HOOK_PRESETS: HookPreset[] = [
  {
    id: "peace",
    ur: "دل کو سکون دینے والی آیت",
    en: "A Verse That Brings Peace to the Heart",
  },
  {
    id: "tawakkul",
    ur: "توکل اور بھروسے پر ایک آیت",
    en: "A Verse on Trust in Allah (Tawakkul)",
  },
  {
    id: "reflection",
    ur: "آج کے غور و فکر کے لیے",
    en: "For Quiet Reflection Today",
  },
  {
    id: "patience",
    ur: "صبر اور استقامت کی روشنی",
    en: "Light of Patience & Steadfastness",
  },
  {
    id: "gratitude",
    ur: "شکر گزاری اور نعمتوں کا ذکر",
    en: "Remembering Gratitude & Blessings",
  },
];

export function getTopicBadgeForSurah(surah: number): { ur: string; en: string } | null {
  if (surah === 2) return { ur: "دعا و توکل", en: "Supplication & Trust" };
  if (surah === 3) return { ur: "رحمت و مشورہ", en: "Mercy & Counsel" };
  if (surah === 65) return { ur: "توکل", en: "Trust in Allah" };
  if (surah === 94) return { ur: "آسانی", en: "Ease After Hardship" };
  if (surah === 13) return { ur: "اطمینانِ قلب", en: "Tranquility" };
  return null;
}
