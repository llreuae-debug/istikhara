export type ReciterId =
  | "ar.alafasy"
  | "ar.abdulbasitmurattal"
  | "ar.husary";

export interface ReciterConfig {
  id: ReciterId;
  nameEn: string;
  nameUr: string;
}

export const RECITERS: ReciterConfig[] = [
  {
    id: "ar.alafasy",
    nameEn: "Mishary Rashid Alafasy",
    nameUr: "مشاري راشد العفاسي",
  },
  {
    id: "ar.abdulbasitmurattal",
    nameEn: "Abdul Basit (Murattal)",
    nameUr: "عبد الباسط عبد الصمد",
  },
  {
    id: "ar.husary",
    nameEn: "Mahmoud Khalil Al-Husary",
    nameUr: "محمود خليل الحصري",
  },
];

export function getReciterName(id: ReciterId, lang: "ur" | "en"): string {
  const found = RECITERS.find((r) => r.id === id) ?? RECITERS[0];
  return lang === "ur" ? found.nameUr : found.nameEn;
}
