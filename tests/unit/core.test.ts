import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  deterministicDateIndex,
  secureRandomInt,
} from "../../src/lib/random";
import { splitBasmala } from "../../src/lib/quran";
import {
  buildSubtitleTimeline,
  chunkTranslation,
  toSrt,
  toVtt,
} from "../../src/lib/video/subtitles";
import { PLATFORM_PRESETS, getSafeBox } from "../../src/config/platforms";
import ur from "../../src/content/i18n/ur.json";
import en from "../../src/content/i18n/en.json";

describe("random.ts", () => {
  it("generates uniform integers within 1..6236", () => {
    for (let i = 0; i < 200; i++) {
      const n = secureRandomInt(1, 6236);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6236);
    }
  });

  it("produces deterministic daily index for a given date", () => {
    const a = deterministicDateIndex("2026-11-18", 40);
    const b = deterministicDateIndex("2026-11-18", 40);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(40);
  });
});

describe("quran.ts basmala & index", () => {
  it("handles basmala correctly on 1:1, 2:1, 9:1, and 96:1", () => {
    const loadFirst = (s: number) => {
      const j = JSON.parse(
        fs.readFileSync(
          path.resolve(`public/data/quran/quran-uthmani/${s}.json`),
          "utf8"
        )
      );
      return j.ayahs[0].text as string;
    };

    const s1 = splitBasmala(loadFirst(1), 1, 1);
    expect(s1.basmalaHeader).toBeNull();
    expect(s1.text).toContain("بِسْمِ");

    const s2 = splitBasmala(loadFirst(2), 2, 1);
    expect(s2.basmalaHeader).not.toBeNull();
    expect(s2.text.startsWith("بِسْمِ")).toBe(false);

    const s9 = splitBasmala(loadFirst(9), 9, 1);
    expect(s9.basmalaHeader).toBeNull();

    const s96 = splitBasmala(loadFirst(96), 96, 1);
    expect(s96.basmalaHeader).not.toBeNull();
    expect(s96.text.startsWith("بِسْمِ")).toBe(false);
  });

  it("maps all 6236 global ayahs continuously", () => {
    const idx = JSON.parse(
      fs.readFileSync(path.resolve("public/data/quran/index.json"), "utf8")
    );
    expect(idx.surahs).toHaveLength(114);
    expect(Object.keys(idx.ayahs)).toHaveLength(6236);
    expect(idx.ayahs["1"]).toEqual({ s: 1, a: 1, j: 1 });
    expect(idx.ayahs["6236"]).toEqual({ s: 114, a: 6, j: 30 });
  });
});

describe("subtitles.ts", () => {
  it("chunks translation and outputs valid SRT & VTT", () => {
    const chunks = chunkTranslation(
      "So by mercy from Allah you were lenient with them and if you had been rude they would have dispersed",
      8
    );
    expect(chunks.length).toBeGreaterThan(1);
    const cues = buildSubtitleTimeline(chunks, 1.5, 8.0);
    expect(cues[0].startSec).toBe(1.5);
    expect(cues[cues.length - 1].endSec).toBeCloseTo(9.5, 4);
    expect(toSrt(cues)).toContain("-->");
    expect(toVtt(cues)).toContain("WEBVTT");
  });
});

describe("platforms.ts safe zones", () => {
  it("keeps every safe-zone box inside canvas bounds", () => {
    for (const p of PLATFORM_PRESETS) {
      const box = getSafeBox(p);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(p.width);
      expect(box.y + box.height).toBeLessThanOrEqual(p.height);
      expect(box.width).toBeGreaterThan(400);
      expect(box.height).toBeGreaterThan(400);
    }
  });
});

describe("i18n key parity", () => {
  it("matches all keys between ur.json and en.json", () => {
    const flatten = (o: Record<string, unknown>, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === "object" && !Array.isArray(v)
          ? flatten(v as Record<string, unknown>, p ? `${p}.${k}` : k)
          : [p ? `${p}.${k}` : k]
      );
    expect(flatten(ur).sort()).toEqual(flatten(en).sort());
  });
});
