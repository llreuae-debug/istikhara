import { UNIVERSAL_SAFE_BOX } from "@/config/platforms916";
import type { WordBox } from "./wordLayout";
import type { WordTimingTuple } from "./wordTiming";

export type PointerStyle = "hand" | "qalam" | "underline" | "glow" | "off";

export interface PointerRenderState {
  x: number;
  y: number;
  alpha: number;
  scale: number;
  underlineProgress: number;
  activeWordIndex: number;
  page: number;
}

function cubicEaseInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * Computes interpolated pointer coordinates (RTL) with line-jump arc and gentle bob.
 */
export function computePointerState(
  boxes: WordBox[],
  timings: WordTimingTuple[],
  relMs: number
): PointerRenderState | null {
  if (boxes.length === 0 || timings.length === 0) return null;

  let activeIdx = 0;
  for (let i = 0; i < timings.length; i++) {
    const [, start, end] = timings[i];
    if (relMs >= start && relMs <= end) {
      activeIdx = i;
      break;
    }
    if (relMs < start) {
      activeIdx = Math.max(0, i - 1);
      break;
    }
    activeIdx = i;
  }

  const curr = boxes[Math.min(activeIdx, boxes.length - 1)];
  const prev = boxes[Math.max(0, activeIdx - 1)];
  const timing = timings[Math.min(activeIdx, timings.length - 1)];
  const wordStart = timing[1];
  const wordEnd = timing[2];
  const wordDur = Math.max(120, wordEnd - wordStart);

  const transitionMs = Math.min(180, wordDur * 0.45);
  const elapsedInWord = Math.max(0, relMs - wordStart);
  const moveT =
    activeIdx === 0 || prev.page !== curr.page
      ? 1
      : cubicEaseInOut(Math.min(1, elapsedInWord / transitionMs));

  let x = prev.centerX + (curr.centerX - prev.centerX) * moveT;
  // On line change, place y directly below the target line so the pointer never sweeps through text
  let y =
    prev.line !== curr.line
      ? curr.pointerAnchorY
      : prev.pointerAnchorY + (curr.pointerAnchorY - prev.pointerAnchorY) * moveT;

  // Gentle ±2px natural bob on sustained words
  if (wordDur > 450 && moveT >= 0.9) {
    y += Math.sin((elapsedInWord / 320) * Math.PI) * 2;
  }

  // Clamp strictly inside safe zone
  const s = UNIVERSAL_SAFE_BOX;
  x = Math.max(s.x + 28, Math.min(s.x + s.width - 28, x));
  y = Math.max(s.y + 40, Math.min(s.y + s.height - 60, y));

  const alpha =
    prev.page !== curr.page && elapsedInWord < 140
      ? Math.max(0.15, elapsedInWord / 140)
      : 1;

  const underlineProgress = Math.min(1, Math.max(0.15, elapsedInWord / Math.max(180, wordDur * 0.7)));

  return {
    x,
    y,
    alpha,
    scale: 1,
    underlineProgress,
    activeWordIndex: activeIdx,
    page: curr.page,
  };
}

/**
 * Returns the bounding box of the pointer for collision and safe-zone assertions.
 */
export function getPointerBBox(
  x: number,
  y: number,
  style: PointerStyle,
  wordWidth = 60
): { x: number; y: number; width: number; height: number } {
  if (style === "underline") {
    return { x: x - wordWidth / 2, y: y - 2, width: wordWidth, height: 4 };
  }
  if (style === "hand" || style === "qalam") {
    return { x: x - 16, y, width: 32, height: 38 };
  }
  return { x, y, width: 0, height: 0 };
}

/**
 * Draws the selected original vector pointer below the current word.
 * Never covers any letter or diacritic.
 */
export function drawPointer(
  ctx: CanvasRenderingContext2D,
  style: PointerStyle,
  state: PointerRenderState,
  activeBox: WordBox | undefined,
  accentColor: string
) {
  if (style === "off" || style === "glow") return;

  ctx.save();
  ctx.globalAlpha = state.alpha;
  ctx.strokeStyle = accentColor;
  ctx.fillStyle = accentColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (style === "underline" && activeBox) {
    const w = activeBox.width * state.underlineProgress;
    const rightX = activeBox.x + activeBox.width;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(rightX, state.y - 4);
    ctx.lineTo(rightX - w, state.y - 4);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.translate(state.x, state.y);

  if (style === "hand") {
    // Original thin gold line-art hand with index finger pointing straight up (tip at 0,0)
    ctx.lineWidth = 2.4;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    // Index finger pointing up
    ctx.moveTo(-4, 18);
    ctx.lineTo(-4, 4);
    ctx.arc(0, 4, 4, Math.PI, 0, false);
    ctx.lineTo(4, 18);
    // Curled fingers & palm outline
    ctx.quadraticCurveTo(11, 17, 13, 23);
    ctx.lineTo(13, 30);
    ctx.quadraticCurveTo(13, 36, 4, 36);
    ctx.lineTo(-6, 36);
    ctx.quadraticCurveTo(-13, 36, -13, 28);
    ctx.lineTo(-13, 22);
    ctx.quadraticCurveTo(-13, 17, -4, 18);
    ctx.stroke();
  } else if (style === "qalam") {
    // Original calligraphy reed-pen (qalam) nib pointing up (tip at 0,0)
    ctx.lineWidth = 2.4;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, 15);
    ctx.lineTo(5, 36);
    ctx.lineTo(-5, 36);
    ctx.lineTo(-7, 15);
    ctx.closePath();
    ctx.stroke();
    // Nib slit
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, 14);
    ctx.stroke();
  }

  ctx.restore();
}
