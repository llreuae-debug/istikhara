import { describe, expect, it } from "vitest";
import { shapeWordToGlyphPaths } from "../../src/lib/video/harfbuzzWrite";
import { autoContrastForLuminance } from "../../src/lib/video/contrast";
import { SHORTS_TEMPLATES } from "../../src/config/templates";
import { UNIVERSAL_SAFE_BOX } from "../../src/config/platforms916";
import { build916Timeline, type Studio916Options } from "../../src/lib/video/timeline";
import { URDU_TAFSIRS } from "../../src/config/tafsirs";
import type { FetchedAyah } from "../../src/lib/quran";

const SAMPLE_AYAHS: FetchedAyah[] = [
  {
    globalNumber: 6208,
    surahNumber: 108,
    ayahNumber: 1,
    juz: 30,
    surahNameAr: "سُورَةُ الكَوْثَرِ",
    surahNameEn: "Al-Kawthar",
    surahNameEnTranslation: "Abundance",
    arabicText: "إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ",
    basmalaHeader: null,
    urduText: "بے شک ہم نے تم کو کوثر عطا فرمایا ہے۔",
    englishText: "Indeed, We have granted you al-Kawthar.",
  },
  {
    globalNumber: 452,
    surahNumber: 3,
    ayahNumber: 159,
    juz: 4,
    surahNameAr: "سُورَةُ آلِ عِمْرَانَ",
    surahNameEn: "Al-Imran",
    surahNameEnTranslation: "The Family of Imraan",
    arabicText:
      "فَبِمَا رَحْمَةٍ مِّنَ ٱللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ ٱلْقَلْبِ لَٱنفَضُّوا۟ مِنْ حَوْلِكَ",
    basmalaHeader: null,
    urduText: "پس اللہ کی رحمت کی وجہ سے آپ ان کے لیے نرم دل ہیں۔",
    englishText: "So by mercy from Allah, you were lenient with them.",
  },
  {
    globalNumber: 262,
    surahNumber: 2,
    ayahNumber: 255,
    juz: 3,
    surahNameAr: "سُورَةُ البَقَرَةِ",
    surahNameEn: "Al-Baqara",
    surahNameEnTranslation: "The Cow",
    arabicText:
      "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ",
    basmalaHeader: null,
    urduText: "اللہ کے سوا کوئی معبود نہیں وہ زندہ اور سب کا تھامنے والا ہے۔",
    englishText: "Allah - there is no deity except Him, the Ever-Living.",
  },
];

describe("Phase 1 — HarfBuzz WASM RTL Glyph Shaping", () => {
  it("shapes Arabic words into non-empty glyph SVG paths for both indopak and madani", async () => {
    for (const script of ["indopak", "madani"] as const) {
      for (const word of ["بِسْمِ", "ٱلْحَمْدُ"]) {
        const shaped = await shapeWordToGlyphPaths(word, script);
        expect(shaped).not.toBeNull();
        expect(shaped!.glyphs.length).toBeGreaterThan(0);
        expect(shaped!.totalAdvance).toBeGreaterThan(0);
        expect(shaped!.glyphs.some((g) => g.svgPath.length > 0)).toBe(true);
      }
    }
  });
});

describe("Phase 2 — Auto-Contrast Engine", () => {
  it("guarantees >= 4.5:1 WCAG AA contrast across dark, bright, and mid-tone backgrounds", () => {
    for (const lum of [0.0, 0.5, 1.0]) {
      const res = autoContrastForLuminance(lum);
      expect(res.ok).toBe(true);
      expect(res.ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("Phase 3 — 7 Shorts Templates & Safe-Zone Layout", () => {
  it("defines 7 unique templates and keeps all word boxes inside UNIVERSAL_SAFE_BOX", () => {
    expect(SHORTS_TEMPLATES).toHaveLength(7);

    for (const tpl of SHORTS_TEMPLATES) {
      const opts: Studio916Options = {
        mode: "urdu-tarjuma",
        theme: tpl.theme,
        bgCategory: tpl.bgCategory,
        bgStyle: tpl.bgStyle,
        paperStyle: tpl.paperStyle,
        solidConfig: tpl.solidConfig,
        gradientConfig: tpl.gradientConfig,
        mediaConfig: tpl.mediaConfig,
        script: tpl.script,
        arabicFont: tpl.arabicFont,
        urduFont: tpl.urduFont,
        handStyle: tpl.handStyle,
        handAsset: tpl.handAsset,
        handRenderStyle: tpl.handRenderStyle,
        captionStyle: tpl.captionStyle,
        transition: tpl.transition,
        templateId: tpl.id,
        arabicMaxSize: 56,
        urduMaxSize: 38,
        showQr: true,
        showSurahHeader: true,
        readingSpeed: 2.2,
        tafseerAudio: "silence",
        tafsirNameUr: URDU_TAFSIRS[0].nameUr,
        tafsirAuthorUr: URDU_TAFSIRS[0].authorUr,
      };

      for (const ayah of SAMPLE_AYAHS) {
        const tl = build916Timeline([ayah], [6.5], [], opts);
        const verseFrames = tl.frames.filter((f) => f.kind === "verse");
        expect(verseFrames.length).toBeGreaterThanOrEqual(1);

        for (const vf of verseFrames) {
          expect(vf.endSec).toBeGreaterThan(vf.startSec);
          for (const wb of vf.wordBoxes) {
            expect(wb.x).toBeGreaterThanOrEqual(UNIVERSAL_SAFE_BOX.x);
            expect(wb.y).toBeGreaterThanOrEqual(UNIVERSAL_SAFE_BOX.y);
            expect(wb.x + wb.width).toBeLessThanOrEqual(
              UNIVERSAL_SAFE_BOX.x + UNIVERSAL_SAFE_BOX.width
            );
            expect(wb.y + wb.height).toBeLessThanOrEqual(
              UNIVERSAL_SAFE_BOX.y + UNIVERSAL_SAFE_BOX.height
            );
          }
        }
      }
    }
  });
});
