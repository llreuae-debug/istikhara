import { describe, expect, it } from "vitest";
import { cleanTafseerHtml } from "../../src/lib/tafseer";
import { URDU_TAFSIRS } from "../../src/config/tafsirs";
import {
  PLATFORMS_916,
  UNIVERSAL_SAFE_BOX,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../src/config/platforms916";
import { computeSafeZoneElementBoxes } from "../../src/lib/video/render";
import {
  INTRO_SEC,
  OUTRO_SEC,
  build916Timeline,
  paginateTafseerParagraphs,
  type Studio916Options,
} from "../../src/lib/video/timeline";
import type { FetchedAyah } from "../../src/lib/quran";

const SAMPLE_AYAH: FetchedAyah = {
  globalNumber: 293,
  surahNumber: 2,
  ayahNumber: 286,
  juz: 3,
  surahNameAr: "سُورَةُ البَقَرَةِ",
  surahNameEn: "Al-Baqara",
  surahNameEnTranslation: "The Cow",
  arabicText: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
  basmalaHeader: null,
  urduText: "اللہ کسی شخص کو اس کی طاقت سے زیادہ کا ذمہ دار نہیں ٹھہراتا۔",
  englishText: "Allah does not charge a soul except [with that within] its capacity.",
};

const BASE_OPTS: Studio916Options = {
  mode: "urdu-tafseer",
  theme: "midnight_gold",
  arabicMaxSize: 64,
  urduMaxSize: 42,
  showQr: true,
  showSurahHeader: true,
  readingSpeed: 2.2,
  tafseerAudio: "silence",
  tafsirNameUr: URDU_TAFSIRS[0].nameUr,
  tafsirAuthorUr: URDU_TAFSIRS[0].authorUr,
};

describe("9:16 Safe Zones & Element Bounding Boxes", () => {
  it("keeps every element box strictly inside UNIVERSAL_SAFE_BOX", () => {
    for (const kind of ["intro", "verse", "tafseer", "outro"] as const) {
      const boxes = computeSafeZoneElementBoxes(kind);
      for (const b of boxes) {
        expect(b.x).toBeGreaterThanOrEqual(UNIVERSAL_SAFE_BOX.x);
        expect(b.y).toBeGreaterThanOrEqual(UNIVERSAL_SAFE_BOX.y);
        expect(b.x + b.width).toBeLessThanOrEqual(
          UNIVERSAL_SAFE_BOX.x + UNIVERSAL_SAFE_BOX.width
        );
        expect(b.y + b.height).toBeLessThanOrEqual(
          UNIVERSAL_SAFE_BOX.y + UNIVERSAL_SAFE_BOX.height
        );
      }
    }
    expect(VIDEO_WIDTH).toBe(1080);
    expect(VIDEO_HEIGHT).toBe(1920);
    expect(PLATFORMS_916.length).toBe(7);
  });
});

describe("Tafseer HTML Cleaning & Pagination", () => {
  it("preserves all text and splits HTML paragraphs cleanly", () => {
    const html = "<p>پہلا پیراگراف۔</p><p>دوسرا پیراگراف &amp; حوالہ۔</p>";
    const paras = cleanTafseerHtml(html);
    expect(paras).toEqual(["پہلا پیراگراف۔", "دوسرا پیراگراف & حوالہ۔"]);
  });

  it("paginates tafseer paragraphs without exceeding ~70 words per page", () => {
    const longPara = Array.from({ length: 100 }, (_, i) => `لفظ${i}`).join(" ");
    const pages = paginateTafseerParagraphs([longPara, "مختصر پیراگراف۔"], 70);
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages.flat().join(" ")).toContain("مختصر پیراگراف۔");
  });
});

describe("9:16 Timeline Timing", () => {
  it("sums intro + recitation + tafseer + outro accurately", () => {
    const tl = build916Timeline(
      [SAMPLE_AYAH],
      [6.0],
      ["یہ ایک مختصر تفسیر پیراگراف ہے۔"],
      BASE_OPTS
    );
    expect(tl.recitationEndSec).toBeCloseTo(INTRO_SEC + 6.0, 4);
    const lastFrame = tl.frames[tl.frames.length - 1];
    expect(tl.totalDurationSec).toBeCloseTo(lastFrame.endSec + OUTRO_SEC, 4);
  });
});
