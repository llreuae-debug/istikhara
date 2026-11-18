import { UNIVERSAL_SAFE_BOX, VIDEO_HEIGHT, VIDEO_WIDTH } from "@/config/platforms916";

export type BgCategory =
  | "geometric"
  | "solid"
  | "gradient"
  | "paper"
  | "media"
  | "stock";

export type BgStyle =
  | "girih"
  | "rosette"
  | "hexagonal"
  | "mihrab"
  | "night_dome";

export type PaperStyle =
  | "whiteboard"
  | "parchment"
  | "kraft"
  | "chalkboard"
  | "lined_notebook";

export type VideoTheme = "midnight_gold" | "emerald" | "ivory" | "royal_blue";
export type MotionIntensity = "calm" | "medium" | "vivid";

export interface SolidBgConfig {
  color: string;
  grainPct: number; // 0..6
}

export interface GradientBgConfig {
  stops: string[];
  type: "linear" | "radial";
  angleDeg: number;
  drift: boolean;
}

export interface MediaBgConfig {
  blurPx: number; // 0..30
  darkenPct: number; // 0..80
  tintColor: string;
  tintPct: number; // 0..60
  kenBurns: boolean;
  kenBurnsDir: "in" | "out" | "pan";
  vignette: boolean;
  zoom: number; // 1..2.5
  offsetX: number; // -0.5..0.5
  offsetY: number; // -0.5..0.5
  credit?: string;
}

export const SOLID_SWATCHES = [
  { id: "midnight", label: "Midnight", color: "#0A1A2F" },
  { id: "emerald", label: "Emerald", color: "#0B3D2E" },
  { id: "ivory", label: "Ivory", color: "#F7F1E3" },
  { id: "royal", label: "Royal Blue", color: "#0E1E4A" },
  { id: "charcoal", label: "Charcoal", color: "#1C1E24" },
  { id: "sand", label: "Sand", color: "#E6D7BA" },
  { id: "rose", label: "Rose Dusk", color: "#3A2332" },
  { id: "white", label: "Pure White", color: "#FFFFFF" },
];

export const GRADIENT_PRESETS: Array<{
  id: string;
  label: string;
  stops: string[];
  angleDeg: number;
}> = [
  { id: "midnight_emerald", label: "Midnight → Emerald", stops: ["#0A1A2F", "#0B3D2E"], angleDeg: 145 },
  { id: "dawn", label: "Dawn", stops: ["#26244A", "#7A4B6C", "#D69A72"], angleDeg: 165 },
  { id: "desert_gold", label: "Desert Gold", stops: ["#3A2C1A", "#8A6724", "#D8B665"], angleDeg: 155 },
  { id: "night_sky", label: "Night Sky", stops: ["#050B18", "#0F2647", "#1B436E"], angleDeg: 180 },
  { id: "ocean_calm", label: "Ocean Calm", stops: ["#092536", "#134B5F", "#247284"], angleDeg: 160 },
  { id: "rose_dusk", label: "Rose Dusk", stops: ["#2A1728", "#61324B", "#A66070"], angleDeg: 150 },
];

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
const paperCache = new Map<PaperStyle, HTMLCanvasElement>();

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

  const size = 2200;
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
    const step = 180;
    for (let y = 0; y <= size; y += step) {
      for (let x = 0; x <= size; x += step) {
        drawPolygon(ctx, x, y, 52, 8, Math.PI / 8);
      }
    }
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

function getOffscreenPaperLayer(paper: PaperStyle): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const cached = paperCache.get(paper);
  if (cached) return cached;

  const off = document.createElement("canvas");
  off.width = VIDEO_WIDTH;
  off.height = VIDEO_HEIGHT;
  const ctx = off.getContext("2d");
  if (!ctx) return null;

  const baseColors: Record<PaperStyle, string> = {
    whiteboard: "#F8F9FB",
    parchment: "#F3EAD3",
    kraft: "#C8A97E",
    chalkboard: "#1D2C26",
    lined_notebook: "#FCFBF7",
  };
  ctx.fillStyle = baseColors[paper];
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  // Procedural subtle paper fibers / grain
  for (let i = 0; i < 450; i++) {
    const x = (i * 499) % VIDEO_WIDTH;
    const y = (i * 857) % VIDEO_HEIGHT;
    ctx.fillStyle =
      paper === "chalkboard"
        ? "rgba(255,255,255,0.03)"
        : "rgba(80,60,30,0.025)";
    ctx.fillRect(x, y, (i % 5) + 2, 1.5);
  }

  if (paper === "lined_notebook") {
    ctx.strokeStyle = "rgba(85, 135, 200, 0.24)";
    ctx.lineWidth = 1.5;
    for (let y = 180; y < VIDEO_HEIGHT; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIDEO_WIDTH, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(210, 80, 90, 0.28)";
    ctx.beginPath();
    ctx.moveTo(110, 0);
    ctx.lineTo(110, VIDEO_HEIGHT);
    ctx.stroke();
  } else if (paper === "parchment") {
    const vig = ctx.createRadialGradient(
      VIDEO_WIDTH / 2,
      VIDEO_HEIGHT / 2,
      VIDEO_WIDTH * 0.25,
      VIDEO_WIDTH / 2,
      VIDEO_HEIGHT / 2,
      VIDEO_HEIGHT * 0.7
    );
    vig.addColorStop(0, "rgba(255,255,255,0)");
    vig.addColorStop(1, "rgba(130,90,40,0.22)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  } else if (paper === "chalkboard") {
    const dust = ctx.createRadialGradient(
      VIDEO_WIDTH * 0.5,
      VIDEO_HEIGHT * 0.42,
      60,
      VIDEO_WIDTH * 0.5,
      VIDEO_HEIGHT * 0.5,
      VIDEO_HEIGHT * 0.65
    );
    dust.addColorStop(0, "rgba(255,255,255,0.06)");
    dust.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.fillStyle = dust;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  }

  paperCache.set(paper, off);
  return off;
}

export function drawAnimatedBackground(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  options: {
    category?: BgCategory;
    style: BgStyle;
    theme: VideoTheme;
    paperStyle?: PaperStyle;
    solidConfig?: SolidBgConfig;
    gradientConfig?: GradientBgConfig;
    mediaConfig?: MediaBgConfig;
    mediaSource?: CanvasImageSource | null;
    mediaDimensions?: { width: number; height: number };
    motion: MotionIntensity;
    audioReactive: boolean;
    particles: boolean;
    audioLevel?: number;
    activeWordCenter?: { x: number; y: number } | null;
    totalDurationSec?: number;
  }
) {
  const category = options.category ?? "geometric";
  const pal = THEME_PALETTES[options.theme];

  if (category === "solid") {
    ctx.fillStyle = options.solidConfig?.color || "#0A1A2F";
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    const grain = options.solidConfig?.grainPct ?? 0;
    if (grain > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(128, 128, 128, ${(grain / 100).toFixed(3)})`;
      for (let i = 0; i < 320; i++) {
        ctx.fillRect((i * 541) % VIDEO_WIDTH, (i * 911) % VIDEO_HEIGHT, 2, 2);
      }
      ctx.restore();
    }
    return;
  }

  if (category === "gradient") {
    const gc = options.gradientConfig ?? {
      stops: ["#0A1A2F", "#0B3D2E"],
      type: "linear" as const,
      angleDeg: 145,
      drift: true,
    };
    const driftDeg = gc.drift ? Math.sin(tSec * 0.25) * 14 : 0;
    const rad = ((gc.angleDeg + driftDeg) * Math.PI) / 180;
    const grad =
      gc.type === "radial"
        ? ctx.createRadialGradient(
            VIDEO_WIDTH / 2,
            VIDEO_HEIGHT * 0.4,
            80,
            VIDEO_WIDTH / 2,
            VIDEO_HEIGHT / 2,
            VIDEO_HEIGHT * 0.72
          )
        : ctx.createLinearGradient(
            VIDEO_WIDTH / 2 - Math.cos(rad) * 800,
            VIDEO_HEIGHT / 2 - Math.sin(rad) * 1000,
            VIDEO_WIDTH / 2 + Math.cos(rad) * 800,
            VIDEO_HEIGHT / 2 + Math.sin(rad) * 1000
          );
    const stops = gc.stops.length >= 2 ? gc.stops : ["#0A1A2F", "#0B3D2E"];
    stops.forEach((c, idx) => grad.addColorStop(idx / (stops.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    return;
  }

  if (category === "paper") {
    const layer = getOffscreenPaperLayer(options.paperStyle ?? "whiteboard");
    if (layer) ctx.drawImage(layer, 0, 0);
    return;
  }

  if ((category === "media" || category === "stock") && options.mediaSource) {
    const mc = options.mediaConfig ?? {
      blurPx: 8,
      darkenPct: 45,
      tintColor: "#0A1A2F",
      tintPct: 15,
      kenBurns: true,
      kenBurnsDir: "in",
      vignette: true,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    };
    const dur = Math.max(1, options.totalDurationSec ?? 15);
    const prog = Math.min(1, tSec / dur);
    const kbZoom = mc.kenBurns
      ? mc.kenBurnsDir === "out"
        ? 1.12 - 0.12 * prog
        : 1 + 0.12 * prog
      : 1;
    const totalZoom = mc.zoom * kbZoom;
    const sw = options.mediaDimensions?.width || VIDEO_WIDTH;
    const sh = options.mediaDimensions?.height || VIDEO_HEIGHT;
    const coverScale = Math.max(VIDEO_WIDTH / sw, VIDEO_HEIGHT / sh) * totalZoom;
    const dw = sw * coverScale;
    const dh = sh * coverScale;
    const dx = (VIDEO_WIDTH - dw) / 2 + mc.offsetX * VIDEO_WIDTH;
    const dy = (VIDEO_HEIGHT - dh) / 2 + mc.offsetY * VIDEO_HEIGHT;

    ctx.save();
    if (mc.blurPx > 0) ctx.filter = `blur(${mc.blurPx}px)`;
    ctx.drawImage(options.mediaSource, dx, dy, dw, dh);
    ctx.restore();

    if (mc.darkenPct > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(mc.darkenPct / 100).toFixed(2)})`;
      ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    }
    if (mc.tintPct > 0) {
      ctx.save();
      ctx.globalAlpha = mc.tintPct / 100;
      ctx.fillStyle = mc.tintColor;
      ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      ctx.restore();
    }
    if (mc.vignette) {
      const vig = ctx.createRadialGradient(
        VIDEO_WIDTH / 2,
        VIDEO_HEIGHT / 2,
        VIDEO_WIDTH * 0.28,
        VIDEO_WIDTH / 2,
        VIDEO_HEIGHT / 2,
        VIDEO_HEIGHT * 0.7
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    }
    return;
  }

  // Default: Geometric animated Islamic patterns
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
