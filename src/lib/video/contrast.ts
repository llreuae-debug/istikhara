export interface AutoContrastResult {
  textColor: string;
  subtextColor: string;
  accentColor: string;
  panelBg: string;
  textShadow: string;
  bgLuminance: number;
  ratio: number;
  ok: boolean;
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

export function contrastRatio(l1: number, l2: number): number {
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

const IVORY_LUM = relativeLuminance(247, 241, 227);
const INK_LUM = relativeLuminance(27, 27, 27);

/**
 * Computes optimal text colour, panel opacity, and shadow for a sampled background
 * luminance so WCAG AA contrast (>= 4.5:1) is always maintained.
 */
export function autoContrastForLuminance(bgLum: number): AutoContrastResult {
  const clamped = Math.max(0, Math.min(1, bgLum));
  const ivoryRatio = contrastRatio(IVORY_LUM, clamped);
  const inkRatio = contrastRatio(INK_LUM, clamped);

  const useDarkText = inkRatio > ivoryRatio;
  let effectiveRatio = Math.max(ivoryRatio, inkRatio);
  let panelAlpha = 0;

  // If raw contrast is below 4.8, add a protective backing panel until >= 4.8:1
  if (effectiveRatio < 4.8) {
    panelAlpha = useDarkText ? 0.82 : 0.78;
    const blendedLum = useDarkText
      ? clamped * (1 - panelAlpha) + 0.96 * panelAlpha
      : clamped * (1 - panelAlpha) + 0.03 * panelAlpha;
    effectiveRatio = useDarkText
      ? contrastRatio(INK_LUM, blendedLum)
      : contrastRatio(IVORY_LUM, blendedLum);
  }

  return {
    textColor: useDarkText ? "#1B1B1B" : "#F7F1E3",
    subtextColor: useDarkText ? "rgba(27, 27, 27, 0.88)" : "rgba(247, 241, 227, 0.92)",
    accentColor: useDarkText ? "#8A6708" : "#E6CF7A",
    panelBg: useDarkText
      ? `rgba(255, 253, 248, ${Math.max(0.78, panelAlpha).toFixed(2)})`
      : `rgba(10, 26, 47, ${Math.max(0.72, panelAlpha).toFixed(2)})`,
    textShadow: useDarkText
      ? "rgba(255, 255, 255, 0.35)"
      : "rgba(0, 0, 0, 0.55)",
    bgLuminance: clamped,
    ratio: Number(effectiveRatio.toFixed(2)),
    ok: effectiveRatio >= 4.5,
  };
}

/**
 * Samples a grid of pixels inside the safe-zone text area on a rendered canvas
 * and returns auto-adjusted text/panel colours meeting >= 4.5:1 contrast.
 */
export function sampleCanvasAutoContrast(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number }
): AutoContrastResult {
  try {
    const cols = 6;
    const rows = 4;
    let sum = 0;
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = Math.round(box.x + ((c + 0.5) / cols) * box.width);
        const sy = Math.round(box.y + ((r + 0.5) / rows) * box.height);
        const px = ctx.getImageData(sx, sy, 1, 1).data;
        sum += relativeLuminance(px[0], px[1], px[2]);
        count++;
      }
    }
    return autoContrastForLuminance(count > 0 ? sum / count : 0.05);
  } catch {
    return autoContrastForLuminance(0.05);
  }
}
