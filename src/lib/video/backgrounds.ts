import { UNIVERSAL_SAFE_BOX, VIDEO_HEIGHT, VIDEO_WIDTH } from "@/config/platforms916";

export type BgStyle =
  | "girih"
  | "rosette"
  | "hexagonal"
  | "mihrab"
  | "night_dome";

export type VideoTheme = "midnight_gold" | "emerald" | "ivory" | "royal_blue";
export type MotionIntensity = "calm" | "medium" | "vivid";

export interface ThemePalette {
  bgInner: string;
  bgOuter: string;
  panel: string;
  text: string;
  subtext: string;
  accent: string;
  line: string;
  divider: string;
}

export const THEME_PALETTES: Record<VideoTheme, ThemePalette> = {
  midnight_gold: {
    bgInner: "#0B3D2E",
    bgOuter: "#0A1A2F",
    panel: "rgba(10, 26, 47, 0.76)",
    text: "#F7F1E3",
    subtext: "rgba(247, 241, 227, 0.92)",
    accent: "#E6CF7A",
    line: "rgba(201, 162, 39, 0.10)",
    divider: "rgba(201, 162, 39, 0.45)",
  },
  emerald: {
    bgInner: "#14614A",
    bgOuter: "#061E16",
    panel: "rgba(6, 30, 22, 0.78)",
    text: "#F7F1E3",
    subtext: "rgba(247, 241, 227, 0.92)",
    accent: "#E6CF7A",
    line: "rgba(230, 207, 122, 0.10)",
    divider: "rgba(230, 207, 122, 0.45)",
  },
  ivory: {
    bgInner: "#FFFDF8",
    bgOuter: "#EDE2CA",
    panel: "rgba(255, 253, 248, 0.88)",
    text: "#1B1B1B",
    subtext: "rgba(27, 27, 27, 0.88)",
    accent: "#9A7610",
    line: "rgba(154, 118, 16, 0.09)",
    divider: "rgba(154, 118, 16, 0.42)",
  },
  royal_blue: {
    bgInner: "#17347A",
    bgOuter: "#0E1E4A",
    panel: "rgba(10, 22, 58, 0.78)",
    text: "#F7F1E3",
    subtext: "rgba(247, 241, 227, 0.92)",
    accent: "#E6CF7A",
    line: "rgba(230, 207, 122, 0.10)",
    divider: "rgba(230, 207, 122, 0.48)",
  },
};

const patternCache = new Map<string, HTMLCanvasElement>();

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  sides: number,
  rot = 0
) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * Math.PI * 2) / sides;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function getOffscreenPatternLayer(
  style: BgStyle,
  theme: VideoTheme,
  pal: ThemePalette
): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const key = `${style}:${theme}`;
  const cached = patternCache.get(key);
  if (cached) return cached;

  const size = 2200; // oversized so rotation never clips corners
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const ctx = off.getContext("2d");
  if (!ctx) return null;

  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1.6;

  if (style === "girih") {
    const step = 220;
    for (let y = 0; y <= size; y += step) {
      for (let x = 0; x <= size; x += step) {
        drawStar(ctx, x, y, 78, 36, 8);
        drawPolygon(ctx, x + step / 2, y + step / 2, 46, 8, Math.PI / 8);
        ctx.beginPath();
        ctx.moveTo(x - step / 2, y);
        ctx.lineTo(x + step / 2, y);
        ctx.moveTo(x, y - step / 2);
        ctx.lineTo(x, y + step / 2);
        ctx.stroke();
      }
    }
  } else if (style === "rosette") {
    const cx = size / 2;
    const cy = size / 2;
    for (let r = 140; r <= 980; r += 120) {
      drawStar(ctx, cx, cy, r, r * 0.72, 12);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI * 2) / 24;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 140, cy + Math.sin(a) * 140);
      ctx.lineTo(cx + Math.cos(a) * 1000, cy + Math.sin(a) * 1000);
      ctx.stroke();
    }
  } else if (style === "hexagonal") {
    const r = 90;
    const dx = r * 1.5;
    const dy = r * Math.sqrt(3);
    for (let col = 0; col * dx <= size + r; col++) {
      for (let row = 0; row * dy <= size + r; row++) {
        const cx = col * dx;
        const cy = row * dy + (col % 2 === 1 ? dy / 2 : 0);
        drawPolygon(ctx, cx, cy, r * 0.92, 6, 0);
        drawStar(ctx, cx, cy, r * 0.68, r * 0.32, 6);
      }
    }
  } else if (style === "mihrab") {
    const cx = size / 2;
    const cy = size / 2;
    // Fine geometric lattice outside
    const step = 180;
    for (let y = 0; y <= size; y += step) {
      for (let x = 0; x <= size; x += step) {
        drawPolygon(ctx, x, y, 52, 8, Math.PI / 8);
      }
    }
    // Pointed Mihrab arch framing the safe zone
    ctx.save();
    ctx.strokeStyle = pal.divider;
    ctx.lineWidth = 2.6;
    const archW = UNIVERSAL_SAFE_BOX.width + 44;
    const left = cx - archW / 2;
    const right = cx + archW / 2;
    const top = cy - 720;
    const shoulder = cy - 420;
    const bottom = cy + 680;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, shoulder);
    ctx.quadraticCurveTo(left, top + 120, cx, top);
    ctx.quadraticCurveTo(right, top + 120, right, shoulder);
    ctx.lineTo(right, bottom);
    ctx.stroke();
    ctx.restore();
  } else if (style === "night_dome") {
    const cx = size / 2;
    const cy = size / 2;
    for (let r = 240; r <= 1050; r += 160) {
      ctx.beginPath();
      ctx.arc(cx, cy + 120, r, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }
    // Faint deterministic stars
    ctx.fillStyle = pal.line;
    for (let i = 0; i < 65; i++) {
      const sx = ((i * 397) % (size - 200)) + 100;
      const sy = ((i * 613) % (size - 200)) + 100;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  patternCache.set(key, off);
  return off;
}

export function drawAnimatedBackground(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  options: {
    style: BgStyle;
    theme: VideoTheme;
    motion: MotionIntensity;
    audioReactive: boolean;
    particles: boolean;
    audioLevel?: number; // smoothed 0..1
    activeWordCenter?: { x: number; y: number } | null;
  }
) {
  const pal = THEME_PALETTES[options.theme];

  // 1. Base radial gradient
  const grad = ctx.createRadialGradient(
    VIDEO_WIDTH / 2,
    VIDEO_HEIGHT * 0.4,
    80,
    VIDEO_WIDTH / 2,
    VIDEO_HEIGHT / 2,
    VIDEO_HEIGHT * 0.72
  );
  grad.addColorStop(0, pal.bgInner);
  grad.addColorStop(1, pal.bgOuter);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  // 2. Pre-rendered geometric layer with slow rotation & 1.2s intro reveal
  const layer = getOffscreenPatternLayer(options.style, options.theme, pal);
  const introAlpha = Math.min(1, tSec / 1.2);
  const turnSeconds =
    options.motion === "vivid" ? 60 : options.motion === "medium" ? 120 : 240;
  const angle =
    options.style === "mihrab"
      ? 0
      : (tSec / turnSeconds) * Math.PI * 2;
  const reactiveBoost = options.audioReactive
    ? 1 + Math.min(0.15, (options.audioLevel ?? 0) * 0.15)
    : 1;

  if (layer) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, introAlpha * reactiveBoost);
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);
    ctx.rotate(angle);
    ctx.drawImage(layer, -layer.width / 2, -layer.height / 2);
    ctx.restore();
  }

  // 3. Soft light sweep near active word
  if (options.activeWordCenter) {
    const sw = ctx.createRadialGradient(
      options.activeWordCenter.x,
      options.activeWordCenter.y,
      10,
      options.activeWordCenter.x,
      options.activeWordCenter.y,
      240
    );
    sw.addColorStop(0, "rgba(230, 207, 122, 0.10)");
    sw.addColorStop(1, "rgba(230, 207, 122, 0)");
    ctx.fillStyle = sw;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  }

  // 4. Optional subtle light particles (<= 40)
  if (options.particles) {
    ctx.save();
    ctx.fillStyle = pal.accent;
    const speedMul =
      options.motion === "vivid" ? 28 : options.motion === "medium" ? 18 : 10;
    for (let i = 0; i < 32; i++) {
      const px = ((i * 193) % (VIDEO_WIDTH - 80)) + 40;
      const py =
        (((i * 271 + tSec * speedMul * (0.6 + (i % 3) * 0.25)) %
          VIDEO_HEIGHT) +
          VIDEO_HEIGHT) %
        VIDEO_HEIGHT;
      ctx.globalAlpha = 0.06 + (i % 4) * 0.025;
      ctx.beginPath();
      ctx.arc(px, py, (i % 2) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 5. Gentle vignette for WCAG AA contrast
  const vig = ctx.createRadialGradient(
    VIDEO_WIDTH / 2,
    VIDEO_HEIGHT / 2,
    VIDEO_WIDTH * 0.32,
    VIDEO_WIDTH / 2,
    VIDEO_HEIGHT / 2,
    VIDEO_HEIGHT * 0.68
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, options.theme === "ivory" ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.34)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
}
