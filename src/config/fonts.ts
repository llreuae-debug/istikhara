export type QuranScript = "indopak" | "madani";

export type ArabicFontId =
  | "kfgqpc-hafs"
  | "amiri-quran"
  | "scheherazade-new"
  | "indopak-nastaleeq";

export type UrduFontId = "noto-nastaliq" | "gulzar";

export interface FontMeta {
  id: string;
  family: string;
  labelUr: string;
  labelEn: string;
  script?: QuranScript;
  license: string;
}

export const ARABIC_QURAN_FONTS: Record<ArabicFontId, FontMeta> = {
  "kfgqpc-hafs": {
    id: "kfgqpc-hafs",
    family: "KFGQPC Uthmanic Script HAFS",
    labelUr: "مصحفِ مدینہ (KFGQPC حفص)",
    labelEn: "KFGQPC Uthmanic HAFS (Madani)",
    script: "madani",
    license: "King Fahd Glorious Quran Printing Complex (unmodified digital display)",
  },
  "amiri-quran": {
    id: "amiri-quran",
    family: "Amiri Quran",
    labelUr: "امیری قرآن",
    labelEn: "Amiri Quran",
    script: "madani",
    license: "SIL Open Font License 1.1 (OFL)",
  },
  "scheherazade-new": {
    id: "scheherazade-new",
    family: "Scheherazade New",
    labelUr: "شہر زاد نیو",
    labelEn: "Scheherazade New",
    script: "madani",
    license: "SIL Open Font License 1.1 (OFL)",
  },
  "indopak-nastaleeq": {
    id: "indopak-nastaleeq",
    family: "Indopak Nastaleeq",
    labelUr: "انڈو پاک نستعلیق (QUL)",
    labelEn: "Indopak Nastaleeq (QUL)",
    script: "indopak",
    license: "QUL / Quran.com Open Distribution",
  },
};

export const URDU_FONTS: Record<UrduFontId, FontMeta> = {
  "noto-nastaliq": {
    id: "noto-nastaliq",
    family: "Noto Nastaliq Urdu",
    labelUr: "نوٹو نستعلیق اردو",
    labelEn: "Noto Nastaliq Urdu",
    license: "SIL Open Font License 1.1 (OFL)",
  },
  gulzar: {
    id: "gulzar",
    family: "Gulzar",
    labelUr: "گلزار نستعلیق",
    labelEn: "Gulzar",
    license: "SIL Open Font License 1.1 (OFL)",
  },
};

export const DECORATIVE_FONTS = {
  kufi: "Reem Kufi",
  ruqaa: "Aref Ruqaa",
} as const;

export const ENGLISH_FONTS = {
  heading: "Cormorant Garamond",
  ui: "Inter",
} as const;

export const NASTALIQ_LINE_HEIGHT = 2.35; // >= 2.3 so tall ascenders never clip
export const NASTALIQ_TOP_PADDING = 22;

export function getDefaultScript(uiLang: "ur" | "en"): QuranScript {
  return uiLang === "ur" ? "indopak" : "madani";
}

export function getDefaultArabicFont(script: QuranScript): ArabicFontId {
  return script === "indopak" ? "indopak-nastaleeq" : "kfgqpc-hafs";
}

export function getArabicFontStack(
  script: QuranScript,
  fontId?: ArabicFontId
): string {
  if (script === "indopak") {
    return `'Indopak Nastaleeq', 'Noto Nastaliq Urdu', serif`;
  }
  const resolved = fontId && fontId !== "indopak-nastaleeq" ? fontId : "kfgqpc-hafs";
  switch (resolved) {
    case "amiri-quran":
      return `'Amiri Quran', 'Scheherazade New', serif`;
    case "scheherazade-new":
      return `'Scheherazade New', 'Amiri Quran', serif`;
    case "kfgqpc-hafs":
    default:
      return `'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', 'Scheherazade New', serif`;
  }
}

export function getUrduFontStack(fontId: UrduFontId = "noto-nastaliq"): string {
  if (fontId === "gulzar") {
    return `'Gulzar', 'Noto Nastaliq Urdu', serif`;
  }
  return `'Noto Nastaliq Urdu', 'Gulzar', serif`;
}

/**
 * Returns the exact text edition paired with the selected script/font.
 * Never mix a font with the wrong text encoding.
 */
export function getScriptTextEdition(
  script: QuranScript,
  arabicFont?: ArabicFontId
): "qul-indopak" | "qpc-hafs" | "quran-uthmani" {
  if (script === "indopak") return "qul-indopak";
  if (arabicFont === "amiri-quran") return "quran-uthmani";
  return "qpc-hafs";
}

/**
 * Ensures all requested font families are loaded into the browser font set
 * before measuring or drawing on HTMLCanvasElement / OffscreenCanvas.
 */
export async function ensureFontsLoaded(
  families: string[] = [
    "KFGQPC Uthmanic Script HAFS",
    "Indopak Nastaleeq",
    "Amiri Quran",
    "Scheherazade New",
    "Noto Nastaliq Urdu",
    "Gulzar",
    "Reem Kufi",
    "Aref Ruqaa",
    "Cormorant Garamond",
    "Inter",
  ]
): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  await Promise.allSettled(
    families.map((fam) => document.fonts.load(`16px "${fam}"`))
  );
  await document.fonts.ready;
}
