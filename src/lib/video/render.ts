import { BRAND } from "@/brand";
import { getSafeBox, type PlatformPreset } from "@/config/platforms";
import { getReciterName, type ReciterId } from "@/config/reciters";
import {
  INTRO_SEC,
  OUTRO_SEC,
  wrapCanvasText,
  type VersePage,
  type VideoStudioOptions,
} from "./timeline";

const THEME_PALETTES = {
  midnight_gold: {
    bgInner: "#0B3D2E",
    bgOuter: "#0A1A2F",
    text: "#F7F1E3",
    subtext: "rgba(247, 241, 227, 0.88)",
    accent: "#E6CF7A",
    line: "rgba(201, 162, 39, 0.14)",
  },
  emerald: {
    bgInner: "#14614A",
    bgOuter: "#061E16",
    text: "#F7F1E3",
    subtext: "rgba(247, 241, 227, 0.9)",
    accent: "#E6CF7A",
    line: "rgba(230, 207, 122, 0.14)",
  },
  ivory: {
    bgInner: "#FFFDF8",
    bgOuter: "#EDE2CA",
    text: "#1B1B1B",
    subtext: "rgba(27, 27, 27, 0.84)",
    accent: "#9A7610",
    line: "rgba(154, 118, 16, 0.16)",
  },
} as const;

export function renderVideoFrame(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  totalDurationSec: number,
  pages: VersePage[],
  preset: PlatformPreset,
  options: VideoStudioOptions,
  reciter: ReciterId,
  qrImg: HTMLImageElement | null,
  partLabel?: string
) {
  const { width, height } = preset;
  const safe = getSafeBox(preset);
  const pal = THEME_PALETTES[options.theme];
  const scale = width / 1080;

  // 1. Background fill
  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.38,
    40,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75
  );
  grad.addColorStop(0, pal.bgInner);
  grad.addColorStop(1, pal.bgOuter);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle geometric girih lines
  ctx.save();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1.5 * scale;
  const rot = (tSec / 240) * Math.PI * 2;
  ctx.translate(width / 2, height / 2);
  ctx.rotate(rot);
  const gridR = Math.max(width, height) * 0.45;
  ctx.strokeRect(-gridR, -gridR, gridR * 2, gridR * 2);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-gridR, -gridR, gridR * 2, gridR * 2);
  ctx.restore();

  // Safe-zone subtle frame
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(safe.x, safe.y, safe.width, safe.height);

  const outroStart = totalDurationSec - OUTRO_SEC;

  // 2. INTRO (0..1.5s)
  if (tSec < INTRO_SEC) {
    const p = Math.min(1, tSec / INTRO_SEC);
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.4);
    BRAND.drawMark(ctx, width / 2, safe.y + safe.height * 0.42, 160 * scale, pal.accent);
    ctx.textAlign = "center";
    ctx.fillStyle = pal.text;
    ctx.font = `600 ${Math.round(52 * scale)}px 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText("Istikhara  •  استخارہ", width / 2, safe.y + safe.height * 0.58);
    ctx.restore();
    return;
  }

  // 3. OUTRO (last 2.5s)
  if (tSec >= outroStart) {
    const p = Math.min(1, (tSec - outroStart) / 0.5);
    ctx.save();
    ctx.globalAlpha = p;
    BRAND.drawMark(ctx, width / 2, safe.y + safe.height * 0.24, 130 * scale, pal.accent);

    ctx.textAlign = "center";
    ctx.fillStyle = pal.text;
    ctx.font = `600 ${Math.round(48 * scale)}px 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText("استخارہ — Istikhara", width / 2, safe.y + safe.height * 0.39);

    ctx.fillStyle = pal.accent;
    ctx.font = `600 ${Math.round(30 * scale)}px 'Inter', sans-serif`;
    ctx.fillText(BRAND.appUrl.replace(/^https?:\/\//, ""), width / 2, safe.y + safe.height * 0.47);

    if (options.showQr && qrImg) {
      const qrSize = Math.round(150 * scale);
      ctx.drawImage(
        qrImg,
        width / 2 - qrSize / 2,
        safe.y + safe.height * 0.53,
        qrSize,
        qrSize
      );
    }

    ctx.fillStyle = pal.subtext;
    ctx.font = `500 ${Math.round(24 * scale)}px 'Inter', sans-serif`;
    ctx.fillText(
      "اپنا استخارہ کریں  •  Perform your Istikhara",
      width / 2,
      safe.y + safe.height * 0.80
    );

    ctx.font = `400 ${Math.round(20 * scale)}px 'Inter', sans-serif`;
    ctx.fillText(
      `Recitation: ${getReciterName(reciter, "en")}`,
      width / 2,
      safe.y + safe.height * 0.88
    );
    ctx.restore();
    return;
  }

  // 4. VERSE BODY
  const activePage =
    pages.find((pg) => tSec >= pg.startSec && tSec <= pg.endSec) ?? pages[0];
  if (!activePage) return;

  // Top-left small logo mark (0.7 opacity) inside safe zone
  ctx.save();
  ctx.globalAlpha = 0.7;
  BRAND.drawMark(
    ctx,
    safe.x + 42 * scale,
    safe.y + 42 * scale,
    54 * scale,
    pal.accent
  );
  ctx.restore();

  if (partLabel) {
    ctx.textAlign = "right";
    ctx.fillStyle = pal.accent;
    ctx.font = `600 ${Math.round(22 * scale)}px 'Inter', sans-serif`;
    ctx.fillText(partLabel, safe.x + safe.width - 20 * scale, safe.y + 46 * scale);
  }

  // Reference header
  if (options.showReference) {
    ctx.textAlign = "center";
    ctx.fillStyle = pal.accent;
    ctx.font = `600 ${Math.round(28 * scale)}px 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText(
      `${activePage.ayah.surahNameEn}  •  ${activePage.ayah.surahNumber}:${activePage.ayah.ayahNumber}`,
      safe.x + safe.width / 2,
      safe.y + 92 * scale
    );
  }

  // Arabic verse centered inside safe zone with soft gold sweep
  const arFontPx = Math.round(options.arabicFontSize * scale);
  const arLineH = arFontPx * 1.85;
  const arStartY =
    safe.y + safe.height * 0.34 - ((activePage.arabicLines.length - 1) * arLineH) / 2;

  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.font = `400 ${arFontPx}px 'Amiri Quran', 'Amiri', serif`;

  const pageProgress =
    (tSec - activePage.startSec) /
    Math.max(0.1, activePage.endSec - activePage.startSec);
  const sweepX = safe.x + pageProgress * safe.width;
  const sweepGrad = ctx.createLinearGradient(
    sweepX - 160 * scale,
    0,
    sweepX + 160 * scale,
    0
  );
  sweepGrad.addColorStop(0, pal.text);
  sweepGrad.addColorStop(0.5, pal.accent);
  sweepGrad.addColorStop(1, pal.text);
  ctx.fillStyle = sweepGrad;

  activePage.arabicLines.forEach((line, i) => {
    ctx.fillText(line, safe.x + safe.width / 2, arStartY + i * arLineH);
  });
  ctx.restore();

  // Active translation subtitle chunk
  const activeCue = activePage.cues.find(
    (c) => tSec >= c.startSec && tSec <= c.endSec
  );
  if (activeCue) {
    ctx.save();
    ctx.textAlign = "center";
    const isUrdu = options.langMode === "ar_ur" || options.langMode === "ar_ur_en";
    ctx.direction = isUrdu ? "rtl" : "ltr";
    ctx.fillStyle = pal.subtext;
    const subPx = Math.round((isUrdu ? 28 : 26) * scale);
    ctx.font = isUrdu
      ? `400 ${subPx}px 'Noto Nastaliq Urdu', serif`
      : `400 ${subPx}px 'Inter', sans-serif`;
    const wrapped = wrapCanvasText(ctx, activeCue.text, safe.width - 72 * scale);
    const subStartY = safe.y + safe.height * 0.7;
    wrapped.slice(0, 3).forEach((l, idx) => {
      ctx.fillText(l, safe.x + safe.width / 2, subStartY + idx * (subPx * 1.65));
    });
    ctx.restore();
  }

  // Bottom APP_URL pill inside safe zone (>= 28px on 1080-wide frames)
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = pal.accent;
  ctx.font = `600 ${Math.round(28 * scale)}px 'Inter', sans-serif`;
  ctx.fillText(
    BRAND.appUrl.replace(/^https?:\/\//, ""),
    safe.x + safe.width / 2,
    safe.y + safe.height - 26 * scale
  );
  ctx.restore();
}
