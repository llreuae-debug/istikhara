import type { FetchedAyah } from "@/lib/quran";
import { getSafeBox, type PlatformPreset } from "@/config/platforms";
import { buildSubtitleTimeline, chunkTranslation, type SubtitleCue } from "./subtitles";

export const INTRO_SEC = 1.5;
export const OUTRO_SEC = 2.5;

export type VideoLangMode = "ar_ur" | "ar_en" | "ar_ur_en" | "ar";
export type VideoTheme = "midnight_gold" | "emerald" | "ivory";

export interface VideoStudioOptions {
  langMode: VideoLangMode;
  theme: VideoTheme;
  arabicFontSize: number;
  showReference: boolean;
  showQr: boolean;
}

export interface VersePage {
  ayah: FetchedAyah;
  arabicLines: string[];
  startSec: number;
  endSec: number;
  cues: SubtitleCue[];
}

export function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function buildVerseTimeline(
  ayahs: FetchedAyah[],
  audioDurationsSec: number[],
  preset: PlatformPreset,
  options: VideoStudioOptions
): { pages: VersePage[]; cues: SubtitleCue[]; totalDurationSec: number } {
  const safe = getSafeBox(preset);
  const maxTextW = Math.max(240, safe.width - 64);

  // Measure Arabic lines using an offscreen/temporary canvas context
  const canvas =
    typeof document !== "undefined" ? document.createElement("canvas") : null;
  const ctx = canvas ? canvas.getContext("2d") : null;
  const fontScale = preset.width / 1080;
  const arFontPx = Math.round(options.arabicFontSize * fontScale);
  if (ctx) {
    ctx.font = `400 ${arFontPx}px 'Amiri Quran', 'Amiri', serif`;
  }

  const maxLinesPerPage = preset.height >= 1350 ? 6 : 4;
  const pages: VersePage[] = [];
  const allCues: SubtitleCue[] = [];
  let cursor = INTRO_SEC;
  let cueIndex = 1;

  for (let idx = 0; idx < ayahs.length; idx++) {
    const ayah = ayahs[idx];
    const dur = Math.max(2.5, audioDurationsSec[idx] || 5);
    const fullArabic = `${ayah.arabicText} ﴿${ayah.ayahNumber}﴾`;
    const allLines = ctx
      ? wrapCanvasText(ctx, fullArabic, maxTextW)
      : [fullArabic];

    // Paginate long verses (e.g. 2:255, 2:282)
    const lineGroups: string[][] = [];
    for (let l = 0; l < allLines.length; l += maxLinesPerPage) {
      lineGroups.push(allLines.slice(l, l + maxLinesPerPage));
    }

    let subtitleText = "";
    if (options.langMode === "ar_ur") subtitleText = ayah.urduText;
    else if (options.langMode === "ar_en") subtitleText = ayah.englishText;
    else if (options.langMode === "ar_ur_en")
      subtitleText = `${ayah.urduText} — ${ayah.englishText}`;

    const chunks = subtitleText ? chunkTranslation(subtitleText, 10) : [];
    const totalPageWeight = lineGroups.reduce(
      (s, g) => s + g.join(" ").length,
      0
    );

    let pageCursor = cursor;
    const chunksPerPage = Math.max(
      1,
      Math.ceil(chunks.length / Math.max(1, lineGroups.length))
    );

    for (let p = 0; p < lineGroups.length; p++) {
      const weight = lineGroups[p].join(" ").length;
      const pageDur =
        lineGroups.length === 1
          ? dur
          : (weight / Math.max(1, totalPageWeight)) * dur;
      const pageChunks = chunks.slice(
        p * chunksPerPage,
        p === lineGroups.length - 1 ? chunks.length : (p + 1) * chunksPerPage
      );
      const pageCues = buildSubtitleTimeline(
        pageChunks,
        pageCursor,
        pageDur
      ).map((c) => ({ ...c, index: cueIndex++ }));

      allCues.push(...pageCues);
      pages.push({
        ayah,
        arabicLines: lineGroups[p],
        startSec: pageCursor,
        endSec: pageCursor + pageDur,
        cues: pageCues,
      });
      pageCursor += pageDur;
    }

    cursor += dur;
  }

  return {
    pages,
    cues: allCues,
    totalDurationSec: cursor + OUTRO_SEC,
  };
}
