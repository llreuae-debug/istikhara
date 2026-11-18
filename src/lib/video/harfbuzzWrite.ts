import type { QuranScript } from "@/config/fonts";
import type { WordBox } from "./wordLayout";

export interface ShapedGlyph {
  svgPath: string;
  x: number;
  y: number;
  isMark: boolean;
  approxLength: number;
}

export interface ShapedWord {
  word: string;
  script: QuranScript;
  upem: number;
  totalAdvance: number;
  glyphs: ShapedGlyph[];
}

interface HbModule {
  Blob: new (buf: ArrayBuffer | Uint8Array) => { destroy: () => void };
  Face: new (blob: unknown, index?: number) => { upem?: number; destroy: () => void };
  Font: new (face: unknown) => {
    glyphToPath: (gid: number) => string;
    destroy: () => void;
  };
  Buffer: new () => {
    addText: (t: string) => void;
    guessSegmentProperties: () => void;
    getGlyphInfos: () => Array<{ codepoint: number; cluster: number }>;
    getGlyphPositions: () => Array<{
      xAdvance: number;
      yAdvance: number;
      xOffset: number;
      yOffset: number;
    }>;
    destroy: () => void;
  };
  shape: (font: unknown, buffer: unknown) => void;
}

let hbPromise: Promise<HbModule> | null = null;
const fontCache = new Map<
  QuranScript,
  Promise<{ font: InstanceType<HbModule["Font"]>; upem: number }>
>();
const wordShapeCache = new Map<string, ShapedWord | null>();
const path2dCache = new Map<string, Path2D>();

async function getHb(): Promise<HbModule> {
  if (!hbPromise) {
    hbPromise = import("harfbuzzjs") as unknown as Promise<HbModule>;
  }
  return hbPromise;
}

async function getHbFont(script: QuranScript) {
  const existing = fontCache.get(script);
  if (existing) return existing;

  const p = (async () => {
    const hb = await getHb();
    const fontUrl =
      script === "indopak"
        ? "/fonts/indopak-nastaleeq-waqf-lazim-v4.2.1.ttf"
        : "/fonts/UthmanicHafs1Ver18.ttf";

    let buf: ArrayBuffer;
    if (typeof window === "undefined" || import.meta.env?.VITEST) {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const file = fs.readFileSync(path.resolve(`public${fontUrl}`));
      buf = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    } else {
      const res = await fetch(fontUrl);
      if (!res.ok) throw new Error(`Failed font fetch ${fontUrl}`);
      buf = await res.arrayBuffer();
    }

    const blob = new hb.Blob(buf);
    const face = new hb.Face(blob, 0);
    const upem = face.upem && face.upem > 0 ? face.upem : 1000;
    const font = new hb.Font(face);
    return { font, upem };
  })();

  fontCache.set(script, p);
  return p;
}

function estimateSvgPathLength(d: string): number {
  const nums = d.match(/-?\d+(\.\d+)?/g);
  if (!nums || nums.length < 4) return 240;
  let total = 0;
  for (let i = 2; i + 1 < nums.length; i += 2) {
    const dx = Number(nums[i]) - Number(nums[i - 2]);
    const dy = Number(nums[i + 1]) - Number(nums[i - 1]);
    if (Number.isFinite(dx) && Number.isFinite(dy)) {
      total += Math.min(2000, Math.hypot(dx, dy));
    }
  }
  return Math.max(120, total);
}

/**
 * Shapes an Arabic word with HarfBuzz WASM and extracts per-glyph SVG outlines
 * ordered RTL (right-to-left visual writing order), separating base glyphs and marks.
 */
export async function shapeWordToGlyphPaths(
  word: string,
  script: QuranScript
): Promise<ShapedWord | null> {
  const key = `${script}:${word}`;
  if (wordShapeCache.has(key)) return wordShapeCache.get(key) ?? null;

  try {
    const hb = await getHb();
    const { font, upem } = await getHbFont(script);
    const buffer = new hb.Buffer();
    buffer.addText(word);
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);

    const infos = buffer.getGlyphInfos();
    const positions = buffer.getGlyphPositions();

    const totalAdvance = positions.reduce((s, p) => s + p.xAdvance, 0);
    let penX = 0;
    let penY = 0;
    const rawGlyphs: ShapedGlyph[] = [];

    for (let i = 0; i < infos.length; i++) {
      const gid = infos[i].codepoint;
      const pos = positions[i];
      const svgPath = font.glyphToPath(gid);
      const gx = penX + pos.xOffset;
      const gy = penY + pos.yOffset;
      if (svgPath && svgPath.trim().length > 0) {
        rawGlyphs.push({
          svgPath,
          x: gx,
          y: gy,
          isMark: pos.xAdvance === 0,
          approxLength: estimateSvgPathLength(svgPath),
        });
      }
      penX += pos.xAdvance;
      penY += pos.yAdvance;
    }

    (buffer as { destroy?: () => void }).destroy?.();

    // HarfBuzz returns RTL glyphs in visual left-to-right order -> reverse for right-to-left writing,
    // and draw base letters before diacritics/waqf marks.
    const visualRtl = [...rawGlyphs].reverse();
    const baseGlyphs = visualRtl.filter((g) => !g.isMark);
    const markGlyphs = visualRtl.filter((g) => g.isMark);
    const ordered = [...baseGlyphs, ...markGlyphs];

    const shaped: ShapedWord = {
      word,
      script,
      upem,
      totalAdvance: Math.max(1, totalAdvance),
      glyphs: ordered,
    };
    wordShapeCache.set(key, shaped);
    return shaped;
  } catch (err) {
    console.warn("HarfBuzz shaping fallback for word:", word, err);
    wordShapeCache.set(key, null);
    return null;
  }
}

export function getCachedShapedWord(
  word: string,
  script: QuranScript
): ShapedWord | null {
  return wordShapeCache.get(`${script}:${word}`) ?? null;
}

function getPath2D(svgPath: string): Path2D | null {
  if (typeof Path2D === "undefined") return null;
  let p = path2dCache.get(svgPath);
  if (!p) {
    p = new Path2D(svgPath);
    path2dCache.set(svgPath, p);
  }
  return p;
}

/**
 * Renders a word in outline-to-fill write-on mode (or feathered RTL wipe fallback).
 * Returns the active pen-tip position in canvas coordinates.
 */
export function drawWriteOnWord(
  ctx: CanvasRenderingContext2D,
  shaped: ShapedWord | null,
  box: WordBox,
  progress01: number,
  options: {
    fontFamily: string;
    fontSize: number;
    strokeColor: string;
    fillColor: string;
    chalk?: boolean;
  }
): { penX: number; penY: number } {
  const p = Math.max(0, Math.min(1, progress01));
  const rightEdge = box.x + box.width;

  // Completed word -> crisp solid fill
  if (p >= 1) {
    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.font = `400 ${options.fontSize}px ${options.fontFamily}`;
    ctx.fillStyle = options.fillColor;
    ctx.fillText(box.text, box.centerX, box.baselineY);
    ctx.restore();
    return { penX: box.x, penY: box.baselineY };
  }

  // Fallback: soft feathered RTL wipe reveal if HarfBuzz path not ready
  if (!shaped || shaped.glyphs.length === 0 || typeof Path2D === "undefined") {
    const revealW = box.width * p;
    const edgeX = rightEdge - revealW;
    ctx.save();
    ctx.beginPath();
    ctx.rect(edgeX, box.y - 18, revealW + 8, box.height + 36);
    ctx.clip();
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.font = `400 ${options.fontSize}px ${options.fontFamily}`;
    ctx.fillStyle = options.fillColor;
    ctx.fillText(box.text, box.centerX, box.baselineY);
    ctx.restore();
    return {
      penX: edgeX,
      penY: box.baselineY - options.fontSize * 0.22,
    };
  }

  // True HarfBuzz outline-to-fill write-on
  const scale = options.fontSize / shaped.upem;
  const wordPixelW = shaped.totalAdvance * scale;
  const originX = box.centerX - wordPixelW / 2;
  const originY = box.baselineY;

  const glyphCount = shaped.glyphs.length;
  const strokePhase = Math.min(1, p / 0.85);
  const fillAlpha = p > 0.65 ? Math.min(1, (p - 0.65) / 0.35) : 0;

  let activePenX = rightEdge;
  let activePenY = box.baselineY - options.fontSize * 0.2;

  ctx.save();
  ctx.translate(originX, originY);
  ctx.scale(scale, -scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 0; i < glyphCount; i++) {
    const g = shaped.glyphs[i];
    const gStart = i / glyphCount;
    const gEnd = (i + 1) / glyphCount;
    if (strokePhase <= gStart) continue;

    const localT = Math.min(1, (strokePhase - gStart) / (gEnd - gStart));
    const p2d = getPath2D(g.svgPath);
    if (!p2d) continue;

    ctx.save();
    ctx.translate(g.x, g.y);

    // Track active pen tip on current glyph
    if (localT < 1) {
      activePenX = originX + g.x * scale;
      activePenY = originY - g.y * scale - options.fontSize * 0.16;
    }

    // Pass 1: outline stroke with setLineDash / lineDashOffset
    ctx.strokeStyle = options.strokeColor;
    ctx.lineWidth = (options.chalk ? 3.2 : 2.2) / scale;
    const dashLen = g.approxLength;
    ctx.setLineDash([dashLen]);
    ctx.lineDashOffset = dashLen * (1 - localT);
    ctx.stroke(p2d);

    // Pass 2: fill fades in over last 35% of word's time
    if (fillAlpha > 0) {
      ctx.setLineDash([]);
      ctx.globalAlpha = fillAlpha;
      ctx.fillStyle = options.fillColor;
      ctx.fill(p2d);
    }
    ctx.restore();
  }

  ctx.restore();

  if (strokePhase >= 1) {
    activePenX = originX;
    activePenY = originY - options.fontSize * 0.15;
  }

  return { penX: activePenX, penY: activePenY };
}
