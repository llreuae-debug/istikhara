import type { FetchedAyah } from "@/lib/quran";
import { UNIVERSAL_SAFE_BOX } from "@/config/platforms916";
import { buildSubtitleTimeline, chunkTranslation, type SubtitleCue } from "./subtitles";

export const INTRO_SEC = 1.5;
export const OUTRO_SEC = 2.5;
export const AYAH_GAP_SEC = 0.4;

export type VideoMode = "urdu-tarjuma" | "urdu-tafseer" | "tafseer-only";
export type VideoTheme = "midnight_gold" | "emerald" | "ivory";
export type TafseerAudioMode = "silence" | "repeat_50";

export interface Studio916Options {
  mode: VideoMode;
  theme: VideoTheme;
  arabicMaxSize: number; // default 64, min 40
  urduMaxSize: number; // default 42, min 32
  showQr: boolean;
  showSurahHeader: boolean;
  readingSpeed: number; // 1.5..3.5 words/sec, default 2.2
  tafseerAudio: TafseerAudioMode;
  tafsirNameUr: string;
  tafsirAuthorUr: string;
}

export interface VerseFrame {
  kind: "verse";
  ayah: FetchedAyah;
  arabicLines: string[];
  arabicFontSize: number;
  urduFontSize: number;
  cues: SubtitleCue[];
  startSec: number;
  endSec: number;
  compactHeaderOnly: boolean;
}

export interface TafseerFrame {
  kind: "tafseer";
  ayah: FetchedAyah;
  headerPreviewLines: string[];
  tafsirNameUr: string;
  tafsirAuthorUr: string;
  paragraphs: string[];
  fontSize: number;
  pageNum: number;
  totalPages: number;
  startSec: number;
  endSec: number;
}

export type TimelineFrame = VerseFrame | TafseerFrame;

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

export function autoFitText(
  ctx: CanvasRenderingContext2D | null,
  text: string,
  fontFamily: string,
  maxSize: number,
  minSize: number,
  maxWidth: number,
  maxLines: number
): { fontSize: number; lines: string[] } {
  if (!ctx) {
    return { fontSize: maxSize, lines: [text] };
  }
  for (let size = maxSize; size >= minSize; size -= 2) {
    ctx.font = `400 ${size}px ${fontFamily}`;
    const lines = wrapCanvasText(ctx, text, maxWidth);
    if (lines.length <= maxLines) {
      return { fontSize: size, lines };
    }
  }
  ctx.font = `400 ${minSize}px ${fontFamily}`;
  return { fontSize: minSize, lines: wrapCanvasText(ctx, text, maxWidth) };
}

export function paginateTafseerParagraphs(
  paragraphs: string[],
  maxWordsPerPage = 70
): string[][] {
  if (paragraphs.length === 0) return [];
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentWords = 0;

  const pushSentenceSplit = (para: string) => {
    const sentences = para.split(/(?<=[۔.!?])\s+/).filter(Boolean);
    let chunk = "";
    let chunkWords = 0;
    for (const s of sentences) {
      const sw = s.split(/\s+/).filter(Boolean).length;
      if (chunk && chunkWords + sw > maxWordsPerPage) {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          currentWords = 0;
        }
        pages.push([chunk.trim()]);
        chunk = s;
        chunkWords = sw;
      } else {
        chunk = chunk ? `${chunk} ${s}` : s;
        chunkWords += sw;
      }
    }
    if (chunk.trim()) {
      if (currentWords + chunkWords > maxWordsPerPage && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [chunk.trim()];
        currentWords = chunkWords;
      } else {
        currentPage.push(chunk.trim());
        currentWords += chunkWords;
      }
    }
  };

  for (const para of paragraphs) {
    const wc = para.split(/\s+/).filter(Boolean).length;
    if (wc > maxWordsPerPage) {
      pushSentenceSplit(para);
    } else if (currentWords + wc > maxWordsPerPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [para];
      currentWords = wc;
    } else {
      currentPage.push(para);
      currentWords += wc;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  return pages;
}

export function build916Timeline(
  ayahs: FetchedAyah[],
  audioDurationsSec: number[],
  selectedTafseerParagraphs: string[],
  options: Studio916Options
): {
  frames: TimelineFrame[];
  cues: SubtitleCue[];
  recitationEndSec: number;
  totalDurationSec: number;
} {
  const maxTextW = UNIVERSAL_SAFE_BOX.width - 64; // 806px inside 870px safe box
  const canvas =
    typeof document !== "undefined" ? document.createElement("canvas") : null;
  const ctx = canvas ? canvas.getContext("2d") : null;

  const frames: TimelineFrame[] = [];
  const allCues: SubtitleCue[] = [];
  let cursor = INTRO_SEC;
  let cueIndex = 1;

  // 1. Recitation frames
  for (let idx = 0; idx < ayahs.length; idx++) {
    const ayah = ayahs[idx];
    const dur = Math.max(2.5, audioDurationsSec[idx] || 5);
    const fullArabic = `${ayah.arabicText}\u00A0﴿${ayah.ayahNumber}﴾`;

    const arFit = autoFitText(
      ctx,
      fullArabic,
      "'Amiri Quran', 'Amiri', serif",
      options.arabicMaxSize,
      40,
      maxTextW,
      4
    );

    const urFit = autoFitText(
      ctx,
      ayah.urduText,
      "'Noto Nastaliq Urdu', serif",
      options.urduMaxSize,
      32,
      maxTextW - 32,
      4
    );

    const arGroups: string[][] = [];
    for (let i = 0; i < arFit.lines.length; i += 4) {
      arGroups.push(arFit.lines.slice(i, i + 4));
    }

    const chunks =
      options.mode === "tafseer-only" ? [] : chunkTranslation(ayah.urduText, 10);
    const chunksPerPage = Math.max(1, Math.ceil(chunks.length / arGroups.length));

    let pageCursor = cursor;
    const totalChars = arGroups.reduce((s, g) => s + g.join(" ").length, 0);

    for (let p = 0; p < arGroups.length; p++) {
      const weight = arGroups[p].join(" ").length;
      const pageDur =
        arGroups.length === 1
          ? dur
          : (weight / Math.max(1, totalChars)) * dur;
      const pageChunks = chunks.slice(
        p * chunksPerPage,
        p === arGroups.length - 1 ? chunks.length : (p + 1) * chunksPerPage
      );
      const pageCues = buildSubtitleTimeline(
        pageChunks,
        pageCursor,
        pageDur
      ).map((c) => ({ ...c, index: cueIndex++ }));

      allCues.push(...pageCues);
      frames.push({
        kind: "verse",
        ayah,
        arabicLines: arGroups[p],
        arabicFontSize: arFit.fontSize,
        urduFontSize: urFit.fontSize,
        cues: pageCues,
        startSec: pageCursor,
        endSec: pageCursor + pageDur,
        compactHeaderOnly: options.mode === "tafseer-only",
      });
      pageCursor += pageDur;
    }

    cursor += dur;
    if (idx < ayahs.length - 1) {
      cursor += AYAH_GAP_SEC;
    }
  }

  const recitationEndSec = cursor;

  // 2. Tafseer pages (Modes B and C)
  if (
    (options.mode === "urdu-tafseer" || options.mode === "tafseer-only") &&
    selectedTafseerParagraphs.length > 0 &&
    ayahs.length > 0
  ) {
    const pages = paginateTafseerParagraphs(selectedTafseerParagraphs, 70);
    const firstAyah = ayahs[0];
    const headerPreview = autoFitText(
      ctx,
      `${firstAyah.arabicText}\u00A0﴿${firstAyah.ayahNumber}﴾`,
      "'Amiri Quran', 'Amiri', serif",
      32,
      26,
      maxTextW,
      2
    ).lines.slice(0, 2);

    const speed = Math.max(1.5, Math.min(3.5, options.readingSpeed));
    for (let p = 0; p < pages.length; p++) {
      const words = pages[p]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      const dur = Math.max(4, words / speed);
      frames.push({
        kind: "tafseer",
        ayah: firstAyah,
        headerPreviewLines: headerPreview,
        tafsirNameUr: options.tafsirNameUr,
        tafsirAuthorUr: options.tafsirAuthorUr,
        paragraphs: pages[p],
        fontSize: words > 55 ? 30 : 34,
        pageNum: p + 1,
        totalPages: pages.length,
        startSec: cursor,
        endSec: cursor + dur,
      });
      cursor += dur;
    }
  }

  return {
    frames,
    cues: allCues,
    recitationEndSec,
    totalDurationSec: cursor + OUTRO_SEC,
  };
}
