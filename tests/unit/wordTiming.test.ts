import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { RECITERS } from "@/config/reciters";
import {
  buildProportionalWordTimings,
  getActiveWordIndex,
  loadSurahTimings,
  resolveAyahWordTimings,
  tokenizeQuranWords,
} from "@/lib/video/wordTiming";
import { splitBasmala } from "@/lib/quran";

function loadQuranSurah(edition: string, surah: number) {
  const p = path.resolve(`public/data/quran/${edition}/${surah}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8")) as {
    ayahs: Array<{ numberInSurah: number; text: string }>;
  };
}

// Deterministic sample of 50 ayahs across diverse surahs
const SAMPLE_50: Array<[number, number]> = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
  [2, 2], [2, 255], [2, 286],
  [3, 159], [3, 173], [4, 58], [5, 3], [6, 162], [7, 156],
  [8, 46], [9, 1], [9, 40], [10, 62], [11, 88], [12, 86],
  [13, 28], [14, 7], [16, 97], [17, 80], [18, 10], [19, 96],
  [20, 25], [21, 87], [24, 35], [25, 74], [28, 24], [29, 69],
  [31, 17], [33, 56], [36, 58], [39, 53], [40, 44], [42, 38],
  [48, 1], [55, 13], [59, 22], [65, 3], [67, 1], [93, 5],
  [94, 5], [96, 19], [112, 1], [114, 1],
];

describe("Word timing data & tokenizer (Phase 2)", () => {
  it("attaches standalone waqf marks to the preceding word", () => {
    const tokens = tokenizeQuranWords("قَالَ ۖ إِنَّمَا ۗ أَنَا ۚ رَسُولٌ");
    expect(tokens).toEqual(["قَالَ ۖ", "إِنَّمَا ۗ", "أَنَا ۚ", "رَسُولٌ"]);
  });

  it("matches token count == timing count & monotonic timestamps for 50 ayahs per reciter", async () => {
    for (const r of RECITERS) {
      let matched = 0;
      for (const [s, a] of SAMPLE_50) {
        const timingsFile = await loadSurahTimings(r.id, s);
        expect(timingsFile).not.toBeNull();
        const entry = timingsFile!.ayahs.find((x) => x.ayah === a);
        expect(entry).toBeDefined();

        const surahData = loadQuranSurah("qpc-hafs", s);
        const ayahObj = surahData.ayahs.find((x) => x.numberInSurah === a)!;
        const { text } = splitBasmala(ayahObj.text, s, a);
        const tokens = tokenizeQuranWords(text);

        if (entry!.words.length === tokens.length) {
          matched++;
        }

        const durMs = Math.max(100, entry!.toMs - entry!.fromMs);
        for (let i = 0; i < entry!.words.length; i++) {
          const [idx, startMs, endMs] = entry!.words[i];
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(startMs).toBeGreaterThanOrEqual(0);
          expect(endMs).toBeGreaterThanOrEqual(startMs);
          expect(endMs).toBeLessThanOrEqual(durMs + 5);
          if (i > 0) {
            expect(startMs).toBeGreaterThanOrEqual(entry!.words[i - 1][1]);
          }
        }
      }
      // At least 90% exact 1:1 token-to-segment match on QPC Hafs (fallback handles any rare QDC pause mismatch)
      expect(matched).toBeGreaterThanOrEqual(45);
    }
  });

  it("falls back cleanly to proportional word timings on mismatch or missing reciter", () => {
    const prop = buildProportionalWordTimings(["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"], 4000);
    expect(prop.length).toBe(4);
    expect(prop[0][1]).toBe(0);
    expect(prop[3][2]).toBe(4000);

    const resolved = resolveAyahWordTimings("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", 4000, null);
    expect(resolved.approximate).toBe(true);
    expect(resolved.words.length).toBe(4);
    expect(getActiveWordIndex(resolved.words, 200)).toBe(0);
    expect(getActiveWordIndex(resolved.words, 3900)).toBe(3);
  });
});
