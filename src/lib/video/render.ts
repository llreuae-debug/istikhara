import { BRAND } from "@/brand";
import {
  UNIVERSAL_SAFE_BOX,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "@/config/platforms916";
import { getReciterName, type ReciterId } from "@/config/reciters";
import {
  INTRO_SEC,
  OUTRO_SEC,
  wrapCanvasText,
  type Studio916Options,
  type TimelineFrame,
} from "./timeline";

const THEME_PALETTES = {
  midnight_gold: {
    bgInner: "#0B3D2E",
    bgOuter: "#0A1A2F",
    panel: "rgba(10, 26, 47, 0.72)",
    text: "#F7F1E3",
    subtext: "rgba(247, 241, 227, 0.92)",
    accent: "#E6CF7A",
    line: "rgba(201, 162, 39, 0.08)",
    divider: "rgba(201, 162, 39, 0.45)",
  },
  emerald: {
    bgInner: "#14614A",
    bgOuter: "#061E16",
    panel: "rgba(6, 30, 22, 0.74)",
    text: "#F7F1E3",
    subtext: "rgba(247, 241, 227, 0.92)",
    accent: "#E6CF7A",
    line: "rgba(230, 207, 122, 0.08)",
    divider: "rgba(230, 207, 122, 0.45)",
  },
  ivory: {
    bgInner: "#FFFDF8",
    bgOuter: "#EDE2CA",
    panel: "rgba(255, 253, 248, 0.85)",
    text: "#1B1B1B",
    subtext: "rgba(27, 27, 27, 0.88)",
    accent: "#9A7610",
    line: "rgba(154, 118, 16, 0.08)",
    divider: "rgba(154, 118, 16, 0.4)",
  },
} as const;

export interface ElementBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeSafeZoneElementBoxes(
  kind: "intro" | "verse" | "tafseer" | "outro"
): ElementBox[] {
  const s = UNIVERSAL_SAFE_BOX;
  const brandRow: ElementBox = { id: "brandRow", x: s.x, y: s.y, width: s.width, height: 70 };
  const footerRow: ElementBox = {
    id: "footerRow",
    x: s.x,
    y: s.y + s.height - 100,
    width: s.width,
    height: 100,
  };

  if (kind === "intro") {
    return [
      {
        id: "introCenter",
        x: s.x + 40,
        y: s.y + 320,
        width: s.width - 80,
        height: 420,
      },
    ];
  }
  if (kind === "outro") {
    return [
      {
        id: "outroCard",
        x: s.x + 20,
        y: s.y + 60,
        width: s.width - 40,
        height: s.height - 120,
      },
    ];
  }
  if (kind === "tafseer") {
    return [
      brandRow,
      { id: "compactArabic", x: s.x, y: s.y + 80, width: s.width, height: 120 },
      { id: "tafseerBody", x: s.x, y: s.y + 215, width: s.width, height: s.height - 335 },
      footerRow,
    ];
  }
  return [
    brandRow,
    { id: "surahHeader", x: s.x, y: s.y + 78, width: s.width, height: 50 },
    { id: "arabicBlock", x: s.x, y: s.y + 150, width: s.width, height: 420 },
    { id: "urduPanel", x: s.x, y: s.y + 610, width: s.width, height: 430 },
    footerRow,
  ];
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  pal: (typeof THEME_PALETTES)[keyof typeof THEME_PALETTES]
) {
  const grad = ctx.createRadialGradient(
    VIDEO_WIDTH * 0.5,
    VIDEO_HEIGHT * 0.36,
    40,
    VIDEO_WIDTH * 0.5,
    VIDEO_HEIGHT * 0.5,
    VIDEO_HEIGHT * 0.72
  );
  grad.addColorStop(0, pal.bgInner);
  grad.addColorStop(1, pal.bgOuter);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  // 8-fold Islamic geometric lines at ~8% opacity, slow rotation
  ctx.save();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1.5;
  ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);
  ctx.rotate((tSec / 240) * Math.PI * 2);
  const r = 680;
  ctx.strokeRect(-r, -r, r * 2, r * 2);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-r, -r, r * 2, r * 2);
  ctx.beginPath();
  ctx.arc(0, 0, 420, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBrandAndFooter(
  ctx: CanvasRenderingContext2D,
  options: Studio916Options,
  pal: (typeof THEME_PALETTES)[keyof typeof THEME_PALETTES],
  qrImg: HTMLImageElement | null
) {
  const s = UNIVERSAL_SAFE_BOX;

  // 1. Brand row (~70px)
  ctx.save();
  ctx.globalAlpha = 0.7;
  BRAND.drawMark(ctx, s.x + 28, s.y + 34, 44, pal.accent);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = pal.subtext;
  ctx.font = "600 24px 'Inter', sans-serif";
  ctx.fillText("استخارہ  |  Istikhara", s.x + 64, s.y + 42);
  ctx.restore();

  // 6. Footer row (~100px)
  const footerY = s.y + s.height - 100;
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = pal.accent;
  ctx.font = "600 28px 'Inter', sans-serif";
  ctx.fillText(
    BRAND.appUrl.replace(/^https?:\/\//, ""),
    s.x + 12,
    footerY + 62
  );
  ctx.restore();

  if (options.showQr && qrImg) {
    ctx.drawImage(qrImg, s.x + s.width - 120, footerY - 12, 112, 112);
  }
}

export function render916Frame(
  ctx: CanvasRenderingContext2D,
  tSec: number,
  totalDurationSec: number,
  frames: TimelineFrame[],
  options: Studio916Options,
  reciter: ReciterId,
  qrImg: HTMLImageElement | null,
  partLabel?: string
) {
  const pal = THEME_PALETTES[options.theme];
  const s = UNIVERSAL_SAFE_BOX;

  drawBackground(ctx, tSec, pal);

  // INTRO (0..1.5s)
  if (tSec < INTRO_SEC) {
    const p = Math.min(1, tSec / INTRO_SEC);
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.35);
    BRAND.drawMark(ctx, s.x + s.width / 2, s.y + 420, 170, pal.accent);
    ctx.textAlign = "center";
    ctx.fillStyle = pal.text;
    ctx.font = "600 54px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("Istikhara  •  استخارہ", s.x + s.width / 2, s.y + 590);
    ctx.fillStyle = pal.accent;
    ctx.font = "400 28px 'Noto Nastaliq Urdu', serif";
    ctx.fillText("قرآنی آیات کے ذریعے الہٰی رہنمائی", s.x + s.width / 2, s.y + 665);
    ctx.restore();
    return;
  }

  // OUTRO (last 2.5s)
  const outroStart = totalDurationSec - OUTRO_SEC;
  if (tSec >= outroStart) {
    const p = Math.min(1, (tSec - outroStart) / 0.45);
    ctx.save();
    ctx.globalAlpha = p;
    BRAND.drawMark(ctx, s.x + s.width / 2, s.y + 150, 140, pal.accent);

    ctx.textAlign = "center";
    ctx.fillStyle = pal.text;
    ctx.font = "600 48px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("استخارہ — Istikhara", s.x + s.width / 2, s.y + 295);

    ctx.fillStyle = pal.accent;
    ctx.font = "600 32px 'Inter', sans-serif";
    ctx.fillText(
      BRAND.appUrl.replace(/^https?:\/\//, ""),
      s.x + s.width / 2,
      s.y + 365
    );

    if (options.showQr && qrImg) {
      ctx.drawImage(qrImg, s.x + s.width / 2 - 85, s.y + 420, 170, 170);
    }

    ctx.fillStyle = pal.text;
    ctx.font = "600 30px 'Noto Nastaliq Urdu', serif";
    ctx.fillText("اپنا استخارہ کریں", s.x + s.width / 2, s.y + 665);

    ctx.fillStyle = pal.subtext;
    ctx.font = "400 24px 'Inter', sans-serif";
    ctx.fillText(
      `تلاوت: ${getReciterName(reciter, "ur")}`,
      s.x + s.width / 2,
      s.y + 745
    );

    if (options.mode !== "urdu-tarjuma") {
      ctx.fillText(
        `تفسیر: ${options.tafsirNameUr}`,
        s.x + s.width / 2,
        s.y + 790
      );
    }

    ctx.fillStyle = pal.subtext;
    ctx.font = "400 22px 'Noto Nastaliq Urdu', serif";
    ctx.fillText(
      "یہ آیت غور و فکر کے لیے ہے۔ مسنون استخارہ دو رکعت نماز اور دعا ہے۔",
      s.x + s.width / 2,
      s.y + 920
    );
    ctx.restore();
    return;
  }

  // ACTIVE FRAME
  const active =
    frames.find((f) => tSec >= f.startSec && tSec <= f.endSec) ?? frames[0];
  if (!active) return;

  drawBrandAndFooter(ctx, options, pal, qrImg);

  if (partLabel) {
    ctx.save();
    ctx.textAlign = "right";
    ctx.fillStyle = pal.accent;
    ctx.font = "600 24px 'Inter', sans-serif";
    ctx.fillText(partLabel, s.x + s.width - 12, s.y + 42);
    ctx.restore();
  }

  if (active.kind === "verse") {
    // 2. Surah header
    if (options.showSurahHeader) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = pal.accent;
      ctx.font = "600 26px 'Inter', sans-serif";
      ctx.fillText(
        `سورۃ ${active.ayah.surahNameAr} • ${active.ayah.surahNameEn} • ${active.ayah.surahNumber}:${active.ayah.ayahNumber}`,
        s.x + s.width / 2,
        s.y + 115
      );
      ctx.restore();
    }

    // 3. Arabic block with soft gold sweep
    const arLineH = active.arabicFontSize * 1.9;
    const arStartY = s.y + (active.compactHeaderOnly ? 380 : 250);
    const progress =
      (tSec - active.startSec) / Math.max(0.1, active.endSec - active.startSec);
    const sweepX = s.x + progress * s.width;
    const sweepGrad = ctx.createLinearGradient(sweepX - 180, 0, sweepX + 180, 0);
    sweepGrad.addColorStop(0, pal.text);
    sweepGrad.addColorStop(0.5, pal.accent);
    sweepGrad.addColorStop(1, pal.text);

    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.font = `400 ${active.arabicFontSize}px 'Amiri Quran', 'Amiri', serif`;
    ctx.fillStyle = sweepGrad;
    active.arabicLines.forEach((line, idx) => {
      ctx.fillText(line, s.x + s.width / 2, arStartY + idx * arLineH);
    });
    ctx.restore();

    if (!active.compactHeaderOnly) {
      // 4. Geometric gold divider
      const divY = s.y + 620;
      ctx.save();
      ctx.strokeStyle = pal.divider;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x + 180, divY);
      ctx.lineTo(s.x + s.width - 180, divY);
      ctx.stroke();
      ctx.restore();

      // 5. Urdu translation chunk inside subtle dark contrast panel
      const activeCue =
        active.cues.find((c) => tSec >= c.startSec && tSec <= c.endSec) ??
        active.cues[0];
      if (activeCue) {
        ctx.save();
        ctx.fillStyle = pal.panel;
        ctx.fillRect(s.x + 16, s.y + 660, s.width - 32, 340);
        ctx.strokeStyle = pal.divider;
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x + 16, s.y + 660, s.width - 32, 340);

        ctx.direction = "rtl";
        ctx.textAlign = "center";
        ctx.fillStyle = pal.text;
        ctx.font = `400 ${active.urduFontSize}px 'Noto Nastaliq Urdu', serif`;
        const wrapped = wrapCanvasText(ctx, activeCue.text, s.width - 80);
        const urLineH = active.urduFontSize * 2.25;
        wrapped.slice(0, 4).forEach((line, idx) => {
          ctx.fillText(line, s.x + s.width / 2, s.y + 740 + idx * urLineH);
        });
        ctx.restore();
      }
    }
    return;
  }

  // TAFSEER FRAME (with 400ms cross-fade)
  const fadeAlpha = Math.min(1, (tSec - active.startSec) / 0.4);
  ctx.save();
  ctx.globalAlpha = fadeAlpha;

  // Compact Arabic header strip
  ctx.fillStyle = pal.panel;
  ctx.fillRect(s.x, s.y + 82, s.width, 118);
  ctx.textAlign = "center";
  ctx.fillStyle = pal.accent;
  ctx.font = "600 22px 'Inter', sans-serif";
  ctx.fillText(
    `${active.ayah.surahNameAr} (${active.ayah.surahNumber}:${active.ayah.ayahNumber})`,
    s.x + s.width / 2,
    s.y + 114
  );
  ctx.direction = "rtl";
  ctx.fillStyle = pal.text;
  ctx.font = "400 26px 'Amiri Quran', 'Amiri', serif";
  active.headerPreviewLines.forEach((l, idx) => {
    ctx.fillText(l, s.x + s.width / 2, s.y + 150 + idx * 36);
  });

  // Source attribution
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = pal.accent;
  ctx.font = "600 26px 'Noto Nastaliq Urdu', serif";
  ctx.fillText(
    `تفسیر: ${active.tafsirNameUr} — ${active.tafsirAuthorUr}`,
    s.x + s.width - 12,
    s.y + 245
  );

  // Page badge
  ctx.textAlign = "left";
  ctx.font = "600 22px 'Inter', sans-serif";
  ctx.fillText(
    `${active.pageNum}/${active.totalPages}`,
    s.x + 12,
    s.y + 245
  );

  // Tafseer paragraphs (right-aligned Noto Nastaliq Urdu, line-height 2.3)
  ctx.textAlign = "right";
  ctx.fillStyle = pal.text;
  ctx.font = `400 ${active.fontSize}px 'Noto Nastaliq Urdu', serif`;
  const lineH = active.fontSize * 2.3;
  let py = s.y + 320;
  for (const para of active.paragraphs) {
    const lines = wrapCanvasText(ctx, para, s.width - 36);
    for (const line of lines) {
      if (py > s.y + s.height - 130) break;
      ctx.fillText(line, s.x + s.width - 18, py);
      py += lineH;
    }
    py += 18;
  }

  ctx.restore();
}
