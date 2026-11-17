export interface EditionConfig {
  id: string;
  lang: string;
  labelEn: string;
  labelNative: string;
  dir: "rtl" | "ltr";
  required?: boolean;
}

export const QURAN_EDITIONS: EditionConfig[] = [
  {
    id: "quran-uthmani",
    lang: "ar",
    labelEn: "Arabic (Uthmani)",
    labelNative: "عربی (عثمانی)",
    dir: "rtl",
    required: true,
  },
  {
    id: "ur.jalandhry",
    lang: "ur",
    labelEn: "Urdu — Fateh Muhammad Jalandhry",
    labelNative: "اردو — فتح محمد جالندھری",
    dir: "rtl",
    required: true,
  },
  {
    id: "en.sahih",
    lang: "en",
    labelEn: "English — Sahih International",
    labelNative: "English — Sahih International",
    dir: "ltr",
    required: true,
  },
];

export const OPTIONAL_EDITIONS: EditionConfig[] = [
  {
    id: "hi.hindi",
    lang: "hi",
    labelEn: "Hindi — Suhel Farooq Khan",
    labelNative: "हिन्दी",
    dir: "ltr",
  },
  {
    id: "bn.bengali",
    lang: "bn",
    labelEn: "Bengali — Muhiuddin Khan",
    labelNative: "বাংলা",
    dir: "ltr",
  },
  {
    id: "id.indonesian",
    lang: "id",
    labelEn: "Indonesian — Ministry of Religious Affairs",
    labelNative: "Bahasa Indonesia",
    dir: "ltr",
  },
];
