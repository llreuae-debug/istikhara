import { describe, expect, it } from "vitest";
import { assertUrduOnlyForTts } from "@/lib/tts";
import {
  normalizeSegmentGain,
  PEAK_LIMIT_LINEAR,
  TARGET_LUFS,
} from "@/lib/video/audioMix";
import { build916Timeline, INTRO_SEC } from "@/lib/video/timeline";
import type { FetchedAyah } from "@/lib/quran";

describe("Urdu TTS guard, loudness normalization, and master timeline (Phase 5)", () => {
  it("rejects Arabic Quranic text in assertUrduOnlyForTts and permits Urdu translation", () => {
    expect(() =>
      assertUrduOnlyForTts("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿١﴾")
    ).toThrow(/Arabic Quran/i);
    expect(() =>
      assertUrduOnlyForTts("ٱللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ")
    ).toThrow();
    expect(() =>
      assertUrduOnlyForTts("شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے")
    ).not.toThrow();
  });

  it("normalizes PCM gain to ~-16 LUFS and limits peaks to -1 dBTP", () => {
    const len = 48000;
    const raw = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      raw[i] = 0.05 * Math.sin((2 * Math.PI * 440 * i) / 48000);
    }
    const rmsRaw = Math.sqrt(
      raw.reduce((acc, v) => acc + v * v, 0) / raw.length
    );
    const lufsRaw = 20 * Math.log10(rmsRaw) - 0.691;
    const normalized = normalizeSegmentGain(raw, lufsRaw, TARGET_LUFS);

    let sumSq = 0;
    let peak = 0;
    for (let i = 0; i < normalized.length; i++) {
      sumSq += normalized[i] * normalized[i];
      peak = Math.max(peak, Math.abs(normalized[i]));
    }
    const lufsOut = 20 * Math.log10(Math.sqrt(sumSq / normalized.length)) - 0.691;
    expect(Math.abs(lufsOut - TARGET_LUFS)).toBeLessThanOrEqual(1);
    expect(peak).toBeLessThanOrEqual(PEAK_LIMIT_LINEAR + 1e-4);
  });

  it("places VoiceFrame strictly after recitationEndSec + 0.6s gap with zero overlap", () => {
    const ayah: FetchedAyah = {
      globalNumber: 1,
      surahNumber: 1,
      ayahNumber: 1,
      juz: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      surahNameEnTranslation: "The Opening",
      arabicText: "بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ",
      basmalaHeader: null,
      urduText: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
      englishText: "In the name of Allah...",
    };
    const tl = build916Timeline(
      [ayah],
      [4.5],
      [],
      {
        mode: "urdu-tarjuma",
        theme: "midnight_gold",
        arabicMaxSize: 56,
        urduMaxSize: 38,
        showQr: true,
        showSurahHeader: true,
        readingSpeed: 2.2,
        tafseerAudio: "silence",
        tafsirNameUr: "",
        tafsirAuthorUr: "",
        voiceCreditUr: "AI آواز: ur-PK-UzmaNeural",
      },
      undefined,
      { text: ayah.urduText, durationSec: 3.5 }
    );

    const voiceFrame = tl.frames.find((f) => f.kind === "voice");
    expect(voiceFrame).toBeDefined();
    expect(tl.recitationEndSec).toBeCloseTo(INTRO_SEC + 4.5, 2);
    expect(voiceFrame!.startSec).toBeCloseTo(tl.recitationEndSec + 0.6, 2);
    expect(voiceFrame!.endSec).toBeCloseTo(tl.recitationEndSec + 0.6 + 3.5, 2);
  });
});
