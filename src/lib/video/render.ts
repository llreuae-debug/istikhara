import { BRAND } from "@/brand";
import {
  UNIVERSAL_SAFE_BOX,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "@/config/platforms916";
import {
  getArabicFontStack,
  getUrduFontStack,
  NASTALIQ_LINE_HEIGHT,
  NASTALIQ_TOP_PADDING,
} from "@/config/fonts";
import { getReciterName, type ReciterId } from "@/config/reciters";
import {
  INTRO_SEC,
  OUTRO_SEC,
  wrapCanvasText,
  type Studio916Options,
  type TimelineFrame,
} from "./timeline";
import { computePointerState, drawPointer } from "./pointers";
import {
  drawAnimatedBackground,
  THEME_PALETTES,
  type ThemePalette,
} from "./backgrounds";

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

function drawBrandAndFooter(
  ctx: CanvasRenderingContext2D,
  options: Studio916Options,
  pal: ThemePalette,
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
  partLabel?: string,
  audioLevel?: number
) {
  const pal = THEME_PALETTES[options.theme] ?? THEME_PALETTES.midnight_gold;
  const s = UNIVERSAL_SAFE_BOX;

  const activeVerse = frames.find(
    (f) => f.kind === "verse" && tSec >= f.startSec && tSec <= f.endSec
  );
  let activeWordCenter: { x: number; y: number } | null = null;
  if (activeVerse && activeVerse.kind === "verse") {
    const pState = computePointerState(
      activeVerse.wordBoxes,
      activeVerse.wordTimings,
      Math.max(0, (tSec - activeVerse.ayahStartSec) * 1000)
    );
    const box = pState
      ? activeVerse.wordBoxes.find((b) => b.index === pState.activeWordIndex)
      : undefined;
    if (box) activeWordCenter = { x: box.centerX, y: box.baselineY };
  }

  drawAnimatedBackground(ctx, tSec, {
    style: options.bgStyle ?? "girih",
    theme: options.theme,
    motion: options.motionIntensity ?? "calm",
    audioReactive: options.audioReactiveGlow ?? true,
    particles: options.particles ?? false,
    audioLevel,
    activeWordCenter,
  });

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

    if (options.voiceCreditUr) {
      ctx.fillText(
        options.voiceCreditUr,
        s.x + s.width / 2,
        s.y + 835
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
    // Also fix duplicate سورۃ prefix if Arabic surah name already starts with سورة
    const cleanSurahAr = active.ayah.surahNameAr.replace(/^سُوْرَةُ\s*|^سورة\s*/, "");
    if (options.showSurahHeader) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = pal.accent;
      ctx.font = "600 26px 'Inter', sans-serif";
      ctx.fillText(
        `سورۃ ${cleanSurahAr} • ${active.ayah.surahNameEn} • ${active.ayah.surahNumber}:${active.ayah.ayahNumber}`,
        s.x + s.width / 2,
        s.y + 115
      );
      ctx.restore();
    }

    // 3. Word-by-word RTL Arabic block + Hand Reading pointer
    const arFontStack = getArabicFontStack(
      options.script ?? "indopak",
      options.arabicFont
    );
    const urFontStack = getUrduFontStack(options.urduFont ?? "noto-nastaliq");
    const pointerStyle = options.pointerStyle ?? "hand";
    const relMs = Math.max(0, (tSec - active.ayahStartSec) * 1000);
    const pointerState = computePointerState(
      active.wordBoxes,
      active.wordTimings,
      relMs
    );
    const activeWordIdx = pointerState?.activeWordIndex ?? -1;

    if (active.wordBoxes.length > 0 && pointerStyle !== "off") {
      for (const box of active.wordBoxes) {
        const isCurrent = box.index === activeWordIdx;
        const isRecited = box.index < activeWordIdx;
        const wordTiming = active.wordTimings[box.index];
        const elapsedWordMs = wordTiming ? Math.max(0, relMs - wordTiming[1]) : 0;
        const scaleEase = isCurrent
          ? 1 + 0.04 * Math.min(1, elapsedWordMs / 120)
          : 1;

        ctx.save();
        ctx.direction = "rtl";
        ctx.textAlign = "center";
        ctx.font = `400 ${active.arabicFontSize}px ${arFontStack}`;
        ctx.translate(box.centerX, box.baselineY);
        ctx.scale(scaleEase, scaleEase);

        if (isCurrent) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = pal.accent;
          ctx.shadowColor = pal.accent;
          ctx.shadowBlur = 18;
        } else if (isRecited) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = pal.text;
        } else {
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = pal.text;
        }
        ctx.fillText(box.text, 0, 0);
        ctx.restore();

        // Optional word-by-word Urdu meaning ("لفظی ترجمہ")
        if (box.meaningBaselineY && box.meaningUr) {
          ctx.save();
          ctx.direction = "rtl";
          ctx.textAlign = "center";
          ctx.font = `400 21px ${urFontStack}`;
          ctx.globalAlpha = isCurrent ? 1 : isRecited ? 0.9 : 0.5;
          ctx.fillStyle = isCurrent ? pal.accent : pal.subtext;
          ctx.fillText(box.meaningUr, box.centerX, box.meaningBaselineY);
          ctx.restore();
        }
      }

      if (pointerState) {
        const activeBox = active.wordBoxes.find(
          (b) => b.index === pointerState.activeWordIndex
        );
        drawPointer(ctx, pointerStyle, pointerState, activeBox, pal.accent);
      }
    } else {
      const arLineH = active.arabicFontSize * 1.9;
      const arStartY = s.y + (active.compactHeaderOnly ? 380 : 250);
      ctx.save();
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.font = `400 ${active.arabicFontSize}px ${arFontStack}`;
      ctx.fillStyle = pal.text;
      active.arabicLines.forEach((line, idx) => {
        ctx.fillText(line, s.x + s.width / 2, arStartY + idx * arLineH);
      });
      ctx.restore();
    }

    if (!active.compactHeaderOnly && !active.hideFullTranslation) {
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
        ctx.font = `400 ${active.urduFontSize}px ${urFontStack}`;
        const wrapped = wrapCanvasText(ctx, activeCue.text, s.width - 80);
        const urLineH = active.urduFontSize * NASTALIQ_LINE_HEIGHT;
        wrapped.slice(0, 4).forEach((line, idx) => {
          ctx.fillText(
            line,
            s.x + s.width / 2,
            s.y + 720 + NASTALIQ_TOP_PADDING + idx * urLineH
          );
        });
        ctx.restore();
      }
    }
    return;
  }

  if (active.kind === "voice") {
    // Compact Arabic header strip
    const arFontStack = getArabicFontStack(
      options.script ?? "indopak",
      options.arabicFont
    );
    const urFontStack = getUrduFontStack(options.urduFont ?? "noto-nastaliq");

    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = pal.accent;
    ctx.font = `400 28px ${arFontStack}`;
    active.headerPreviewLines.slice(0, 2).forEach((line, idx) => {
      ctx.fillText(line, s.x + s.width / 2, s.y + 118 + idx * 48);
    });
    ctx.restore();

    // Active Urdu voiceover chunk inside contrast panel
    const activeCue =
      active.cues.find((c) => tSec >= c.startSec && tSec <= c.endSec) ??
      active.cues[0];
    if (activeCue) {
      ctx.save();
      ctx.fillStyle = pal.panel;
      ctx.fillRect(s.x + 16, s.y + 260, s.width - 32, 680);
      ctx.strokeStyle = pal.divider;
      ctx.lineWidth = 1;
      ctx.strokeRect(s.x + 16, s.y + 260, s.width - 32, 680);

      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillStyle = pal.text;
      ctx.font = `400 ${active.fontSize}px ${urFontStack}`;
      const wrapped = wrapCanvasText(ctx, activeCue.text, s.width - 80);
      const urLineH = active.fontSize * NASTALIQ_LINE_HEIGHT;
      wrapped.slice(0, 5).forEach((line, idx) => {
        ctx.fillText(
          line,
          s.x + s.width / 2,
          s.y + 380 + NASTALIQ_TOP_PADDING + idx * urLineH
        );
      });
      ctx.restore();
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
