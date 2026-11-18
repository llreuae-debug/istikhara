export interface TafsirEdition {
  slug: string;
  nameUr: string;
  nameEn: string;
  authorUr: string;
  authorEn: string;
}

// Verified against https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/editions.json (language_name = "urdu")
export const URDU_TAFSIRS: TafsirEdition[] = [
  {
    slug: "ur-tafseer-ibn-e-kaseer",
    nameUr: "تفسیر ابن کثیر",
    nameEn: "Tafsir Ibn Kathir",
    authorUr: "حافظ ابن کثیرؒ",
    authorEn: "Hafiz Ibn Kathir",
  },
  {
    slug: "ur-tafsir-bayan-ul-quran",
    nameUr: "تفسیر بیان القرآن",
    nameEn: "Tafsir Bayan ul Quran",
    authorUr: "ڈاکٹر اسرار احمدؒ",
    authorEn: "Dr. Israr Ahmad",
  },
  {
    slug: "ur-tafsir-fe-zalul-quran-syed-qatab",
    nameUr: "فی ظلال القرآن",
    nameEn: "Fi Zilal al-Quran",
    authorUr: "سید ابراہیم قطبؒ",
    authorEn: "Sayyid Ibrahim Qutb",
  },
  {
    slug: "ur-tazkirul-quran",
    nameUr: "تذکیر القرآن",
    nameEn: "Tazkirul Quran",
    authorUr: "مولانا وحید الدین خان",
    authorEn: "Maulana Wahiduddin Khan",
  },
  {
    slug: "ur-tafsir-as-saadi-urdu",
    nameUr: "تفسیر السعدی",
    nameEn: "Tafsir As-Saadi",
    authorUr: "عبدالرحمٰن السعدیؒ",
    authorEn: "Abdur Rahman As-Saadi",
  },
];

// Optional secondary source (off by default; requires serverless credentials)
export const ENABLE_QURAN_FOUNDATION_TAFSIR = false;

export function getTafsirBySlug(slug: string): TafsirEdition {
  return URDU_TAFSIRS.find((t) => t.slug === slug) ?? URDU_TAFSIRS[0];
}
