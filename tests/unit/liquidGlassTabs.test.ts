import { describe, expect, it } from "vitest";
import {
  computeSqueezeScale,
  nextTabIndexForKey,
  projectNearestTabIndex,
} from "@/components/glass/LiquidGlassTabs";

describe("LiquidGlassTabs physics & keyboard navigation", () => {
  const tabRects = [
    { left: 6, width: 80 },
    { left: 90, width: 90 },
    { left: 184, width: 85 },
    { left: 273, width: 90 },
  ];

  it("projects nearest tab from drag position and velocity", () => {
    // Resting in middle of tab 1
    expect(projectNearestTabIndex(135, tabRects, 0)).toBe(1);
    // Between tab 1 and tab 2, with positive flick velocity -> snaps to tab 2
    expect(projectNearestTabIndex(165, tabRects, 800)).toBe(2);
    // Negative flick velocity -> snaps back toward tab 0
    expect(projectNearestTabIndex(100, tabRects, -900)).toBe(0);
  });

  it("mirrors ArrowLeft / ArrowRight correctly in RTL vs LTR", () => {
    expect(nextTabIndexForKey("ArrowRight", 0, 4, false)).toBe(1);
    expect(nextTabIndexForKey("ArrowLeft", 1, 4, false)).toBe(0);
    // RTL mirrors arrow direction
    expect(nextTabIndexForKey("ArrowLeft", 0, 4, true)).toBe(1);
    expect(nextTabIndexForKey("ArrowRight", 1, 4, true)).toBe(0);
    expect(nextTabIndexForKey("Home", 2, 4, true)).toBe(0);
    expect(nextTabIndexForKey("End", 1, 4, true)).toBe(3);
  });

  it("caps velocity-based squeeze scaleX <= 1.28 and scaleY >= 0.86", () => {
    const s = computeSqueezeScale(5000);
    expect(s.scaleX).toBeLessThanOrEqual(1.28);
    expect(s.scaleY).toBeGreaterThanOrEqual(0.86);
    expect(computeSqueezeScale(0)).toEqual({ scaleX: 1, scaleY: 1 });
  });
});
