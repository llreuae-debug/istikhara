import { describe, expect, it } from "vitest";
import { UNIVERSAL_SAFE_BOX } from "@/config/platforms916";
import { layoutArabicWordsRTL } from "@/lib/video/wordLayout";
import {
  computePointerState,
  getPointerBBox,
  type PointerStyle,
} from "@/lib/video/pointers";
import { buildProportionalWordTimings } from "@/lib/video/wordTiming";

function rectsIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

describe("Hand reading layout & pointer collision (Phase 3)", () => {
  const tokens = [
    "ٱللَّهُ", "لَا", "إِلَٰهَ", "إِلَّا", "هُوَ", "ٱلْحَىُّ", "ٱلْقَيُّومُ",
    "لَا", "تَأْخُذُهُۥ", "سِنَةٌ", "وَلَا", "نَوْمٌ",
  ];
  const meanings = tokens.map((_, i) => `معنی ${i + 1}`);
  const timings = buildProportionalWordTimings(tokens, 6000);

  it("lays out words RTL inside the universal safe zone", () => {
    const layout = layoutArabicWordsRTL(null, tokens, meanings, {
      fontFamily: "'KFGQPC Uthmanic Script HAFS', serif",
      fontSize: 48,
      wordByWordMeaning: false,
    });
    expect(layout.boxes.length).toBe(tokens.length);
    // RTL: word 0 centerX > word 1 centerX on same line
    expect(layout.boxes[0].centerX).toBeGreaterThan(layout.boxes[1].centerX);

    const s = UNIVERSAL_SAFE_BOX;
    for (const box of layout.boxes) {
      expect(box.x).toBeGreaterThanOrEqual(s.x);
      expect(box.x + box.width).toBeLessThanOrEqual(s.x + s.width);
      expect(box.y).toBeGreaterThanOrEqual(s.y);
      expect(box.y + box.height).toBeLessThanOrEqual(s.y + s.height);
    }
  });

  it("ensures pointer bounding box never intersects any text box and stays inside safe zone", () => {
    for (const wordByWordMeaning of [false, true]) {
      const layout = layoutArabicWordsRTL(null, tokens, meanings, {
        fontFamily: "'Indopak Nastaleeq', serif",
        fontSize: 46,
        wordByWordMeaning,
      });

      const styles: PointerStyle[] = ["hand", "qalam", "underline"];
      for (const style of styles) {
        for (let ms = 0; ms <= 6000; ms += 300) {
          const state = computePointerState(layout.boxes, timings, ms);
          expect(state).not.toBeNull();
          const activeBox = layout.boxes[state!.activeWordIndex];
          const pBox = getPointerBBox(state!.x, state!.y, style, activeBox.width);

          // Inside safe zone
          expect(pBox.x).toBeGreaterThanOrEqual(UNIVERSAL_SAFE_BOX.x);
          expect(pBox.x + pBox.width).toBeLessThanOrEqual(
            UNIVERSAL_SAFE_BOX.x + UNIVERSAL_SAFE_BOX.width
          );
          expect(pBox.y).toBeGreaterThanOrEqual(UNIVERSAL_SAFE_BOX.y);
          expect(pBox.y + pBox.height).toBeLessThanOrEqual(
            UNIVERSAL_SAFE_BOX.y + UNIVERSAL_SAFE_BOX.height
          );

          // Does not intersect any Arabic word box on the same page
          for (const box of layout.boxes.filter((b) => b.page === state!.page)) {
            if (box.line <= activeBox.line) {
              expect(rectsIntersect(pBox, box)).toBe(false);
            }
          }
        }
      }
    }
  });
});
