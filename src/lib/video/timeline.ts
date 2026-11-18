import type { FetchedAyah } from "@/lib/quran";
import { UNIVERSAL_SAFE_BOX } from "@/config/platforms916";
import {
  getArabicFontStack,
  getUrduFontStack,
  type ArabicFontId,
  type QuranScript,
  type UrduFontId,
} from "@/config/fonts";
import { buildSubtitleTimeline, chunkTranslation, type SubtitleCue } from "./subtitles";
import { layoutArabicWordsRTL, type WordBox } from "./wordLayout";
import {
  resolveAyahWordTimings,
  type AyahTimingEntry,
  type WordTimingTuple,
} from "./wordTiming";
import type { PointerStyle } from "./pointers";
import type {
  BgCategory,
  BgStyle,
  GradientBgConfig,
  LayeredDesignId,
  MediaBgConfig,
  MotionIntensity,
  PaperStyle,
  SolidBgConfig,
  VideoTheme,
} from "./backgrounds";
import type {
  HandAssetId,
  HandRenderStyle,
  HandSkinTone,
  HandStyleMode,
} from "./handAssets";
import type { CaptionStyle, PageTransition, TemplateId } from "@/config/templates";

export type { VideoTheme };

export const INTRO_SEC = 1.5;
export const OUTRO_SEC = 2.5;
export const AYAH_GAP_SEC = 0.4;

export type VideoMode = "urdu-tarjuma" | "urdu-tafseer" | "tafseer-only";
export type TafseerAudioMode = "silence" | "repeat_50";
export type TextLanguageDisplay = "ar_ur" | "ar_en" | "ar_both" | "ar_only";

export interface Studio916Options {
  mode: VideoMode;
  theme: VideoTheme;
  bgCategory?: BgCategory;
  bgStyle?: BgStyle;
  layeredDesign?: LayeredDesignId;
  paperStyle?: PaperStyle;
  solidConfig?: SolidBgConfig;
  gradientConfig?: GradientBgConfig;
  mediaConfig?: MediaBgConfig;
  motionIntensity?: MotionIntensity;
  audioReactiveGlow?: boolean;
  particles?: boolean;
  script?: QuranScript;
  arabicFont?: ArabicFontId;
  urduFont?: UrduFontId;
  languageDisplay?: TextLanguageDisplay;
  pointerStyle?: PointerStyle;
  handStyle?: HandStyleMode;
  handAsset?: HandAssetId;
  handRenderStyle?: HandRenderStyle;
  handSkinTone?: HandSkinTone;
  handSleeveColor?: string;
  handScale?: number;
  wordByWordMeaning?: boolean;
  arabicMaxSize: number; // default 64, min 40
  urduMaxSize: number; // default 42, min 32
  showQr: boolean;
  showSurahHeader: boolean;
  showReference?: boolean;
  readingSpeed: number; // 1.5..3.5 words/sec, default 2.2
  tafseerAudio: TafseerAudioMode;
  tafsirNameUr: string;
  tafsirAuthorUr: string;
  voiceCreditUr?: string;
  templateId?: TemplateId;
  captionStyle?: CaptionStyle;
  transition?: PageTransition;
  showProgressBar?: boolean;
  showHookCard?: boolean;
  hookText?: string;
  topicBadge?: string;
  showEndScreen?: boolean;
  loopFriendly?: boolean;
  kineticSingleWord?: boolean;
  ornamentalBorder?: boolean;
  doodleBrackets?: boolean;
  chalkTexture?: boolean;
  photoCredit?: string;
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
  ayahStartSec: number;
  wordBoxes: WordBox[];
  wordTimings: WordTimingTuple[];
  approximateSync: boolean;
  pageIndex: number;
  ayahIndex?: number;
  totalAyahs?: number;
  hideFullTranslation?: boolean;
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

export interface VoiceFrame {
  kind: "voice";
  ayah: FetchedAyah;
  headerPreviewLines: string[];
  urduText: string;
  cues: SubtitleCue[];
  fontSize: number;
  startSec: number;
  endSec: number;
}

export type TimelineFrame = VerseFrame | TafseerFrame | VoiceFrame;

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
  options: Studio916Options,
  ayahWordData?: Array<{ entry?: AyahTimingEntry | null; meaningsUr?: string[] }>,
  voiceover?: { text: string; durationSec: number; gapSec?: number }
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

    const arFontStack = getArabicFontStack(
      options.script ?? "indopak",
      options.arabicFont
    );
    const urFontStack = getUrduFontStack(options.urduFont ?? "noto-nastaliq");

    const arFit = autoFitText(
      ctx,
      fullArabic,
      arFontStack,
      options.arabicMaxSize,
      40,
      maxTextW,
      4
    );

    const urFit = autoFitText(
      ctx,
      ayah.urduText,
      urFontStack,
      options.urduMaxSize,
      32,
      maxTextW - 32,
      4
    );

    const arGroups: string[][] = [];
    for (let i = 0; i < arFit.lines.length; i += 4) {
      arGroups.push(arFit.lines.slice(i, i + 4));
    }

    const wordData = ayahWordData?.[idx];
    const resolvedWords = resolveAyahWordTimings(
      ayah.arabicText,
      Math.round(dur * 1000),
      wordData?.entry ?? null,
      wordData?.meaningsUr ?? []
    );
    const wordLayout = layoutArabicWordsRTL(
      ctx,
      resolvedWords.tokens,
      resolvedWords.meaningsUr,
      {
        fontFamily: arFontStack,
        fontSize: arFit.fontSize,
        wordByWordMeaning: Boolean(options.wordByWordMeaning),
        compactHeaderOnly: options.mode === "tafseer-only",
      }
    );

    const numPages = Math.max(1, wordLayout.totalPages);
    const chunks =
      options.mode === "tafseer-only" ? [] : chunkTranslation(ayah.urduText, 10);
    const chunksPerPage = Math.max(1, Math.ceil(chunks.length / numPages));

    let pageCursor = cursor;
    for (let p = 0; p < numPages; p++) {
      const pageBoxes = wordLayout.boxes.filter((b) => b.page === p);
      let pageDur = dur / numPages;
      if (numPages > 1 && pageBoxes.length > 0) {
        const firstIdx = pageBoxes[0].index;
        const lastIdx = pageBoxes[pageBoxes.length - 1].index;
        const nextPageFirst = wordLayout.boxes.find((b) => b.page === p + 1);
        const pStartMs = p === 0 ? 0 : resolvedWords.words[firstIdx]?.[1] ?? (p / numPages) * dur * 1000;
        const pEndMs =
          p === numPages - 1
            ? dur * 1000
            : nextPageFirst
              ? resolvedWords.words[nextPageFirst.index]?.[1] ?? ((p + 1) / numPages) * dur * 1000
              : resolvedWords.words[lastIdx]?.[2] ?? ((p + 1) / numPages) * dur * 1000;
        pageDur = Math.max(0.8, (pEndMs - pStartMs) / 1000);
      }

      const pageChunks = chunks.slice(
        p * chunksPerPage,
        p === numPages - 1 ? chunks.length : (p + 1) * chunksPerPage
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
        arabicLines: arGroups[Math.min(p, arGroups.length - 1)] ?? arFit.lines,
        arabicFontSize: arFit.fontSize,
        urduFontSize: urFit.fontSize,
        cues: pageCues,
        startSec: pageCursor,
        endSec: pageCursor + pageDur,
        compactHeaderOnly: options.mode === "tafseer-only",
        ayahStartSec: cursor,
        wordBoxes: pageBoxes,
        wordTimings: resolvedWords.words,
        approximateSync: resolvedWords.approximate,
        pageIndex: p,
        ayahIndex: idx,
        totalAyahs: ayahs.length,
        hideFullTranslation: Boolean(options.wordByWordMeaning),
      });
      pageCursor += pageDur;
    }

    cursor += dur;
    if (idx < ayahs.length - 1) {
      cursor += AYAH_GAP_SEC;
    }
  }

  // If wordByWordMeaning is on in urdu-tarjuma mode, show full Urdu translation page right after
  if (
    options.wordByWordMeaning &&
    options.mode === "urdu-tarjuma" &&
    ayahs.length > 0
  ) {
    const firstAyah = ayahs[0];
    const combinedUr = ayahs.map((a) => `${a.urduText} (${a.surahNumber}:${a.ayahNumber})`).join("\n");
    const trDur = Math.max(4, combinedUr.split(/\s+/).length / Math.max(1.5, options.readingSpeed));
    frames.push({
      kind: "tafseer",
      ayah: firstAyah,
      headerPreviewLines: [`${firstAyah.arabicText}\u00A0﴿${firstAyah.ayahNumber}﴾`],
      tafsirNameUr: "اردو ترجمہ (فتح محمد جالندھری)",
      tafsirAuthorUr: "",
      paragraphs: ayahs.map((a) => `${a.urduText}`),
      fontSize: Math.min(36, options.urduMaxSize),
      pageNum: 1,
      totalPages: 1,
      startSec: cursor,
      endSec: cursor + trDur,
    });
    cursor += trDur;
  }

  const recitationEndSec = cursor;

  // 2. Voiceover frame (plays strictly after recitation + 0.6s gap, never overlapping)
  if (voiceover && voiceover.durationSec > 0 && ayahs.length > 0) {
    const gap = voiceover.gapSec ?? 0.6;
    const voStart = cursor + gap;
    const voDur = voiceover.durationSec;
    const firstAyah = ayahs[0];
    const headerPreview = autoFitText(
      ctx,
      `${firstAyah.arabicText}\u00A0﴿${firstAyah.ayahNumber}﴾`,
      getArabicFontStack(options.script ?? "indopak", options.arabicFont),
      32,
      26,
      maxTextW,
      2
    ).lines.slice(0, 2);
    const voChunks = chunkTranslation(voiceover.text, 10);
    const voCues = buildSubtitleTimeline(voChunks, voStart, voDur).map((c) => ({
      ...c,
      index: cueIndex++,
    }));
    allCues.push(...voCues);
    frames.push({
      kind: "voice",
      ayah: firstAyah,
      headerPreviewLines: headerPreview,
      urduText: voiceover.text,
      cues: voCues,
      fontSize: Math.min(38, options.urduMaxSize),
      startSec: voStart,
      endSec: voStart + voDur,
    });
    cursor = voStart + voDur;
  }

  // 3. Tafseer pages (Modes B and C, when no voiceover replaces them)
  if (
    !voiceover &&
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
