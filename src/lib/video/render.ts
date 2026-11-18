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
import { sampleCanvasAutoContrast } from "./contrast";
import { drawWriteOnWord, getCachedShapedWord } from "./harfbuzzWrite";
import { drawHandSprite, type CustomHandConfig } from "./handAssets";

export interface RenderExtras {
  mediaSource?: CanvasImageSource | null;
  mediaDimensions?: { width: number; height: number };
  customHandImg?: HTMLImageElement | null;
  customHand?: CustomHandConfig | null;
}

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
  audioLevel?: number,
  extras?: RenderExtras
) {
  const basePal = THEME_PALETTES[options.theme] ?? THEME_PALETTES.midnight_gold;
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
    category: options.bgCategory ?? "geometric",
    style: options.bgStyle ?? "girih",
    layeredDesign: options.layeredDesign,
    theme: options.theme,
    paperStyle: options.paperStyle ?? "whiteboard",
    solidConfig: options.solidConfig,
    gradientConfig: options.gradientConfig,
    mediaConfig: options.mediaConfig,
    mediaSource: extras?.mediaSource,
    mediaDimensions: extras?.mediaDimensions,
    motion: options.motionIntensity ?? "calm",
    audioReactive: options.audioReactiveGlow ?? true,
    particles: options.particles ?? false,
    audioLevel,
    activeWordCenter,
    totalDurationSec,
  });

  // Readability automation: sample background luminance & enforce >= 4.5:1 contrast
  const autoC = sampleCanvasAutoContrast(ctx, {
    x: s.x + 24,
    y: s.y + 180,
    width: s.width - 48,
    height: 620,
  });
  const pal: ThemePalette = {
    ...basePal,
    text: autoC.textColor,
    subtext: autoC.subtextColor,
    accent: autoC.accentColor,
    panel: autoC.panelBg,
  };

  // Top thin gold progress bar inside safe zone
  if (options.showProgressBar !== false && totalDurationSec > 0) {
    const prog = Math.max(0, Math.min(1, tSec / totalDurationSec));
    ctx.save();
    ctx.fillStyle = "rgba(201, 162, 39, 0.22)";
    ctx.fillRect(s.x + 12, s.y + 4, s.width - 24, 4);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(s.x + 12, s.y + 4, (s.width - 24) * prog, 4);
    ctx.restore();
  }

  // Ornamental Mushaf border inside safe zone
  if (options.ornamentalBorder) {
    ctx.save();
    ctx.strokeStyle = pal.divider;
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x + 6, s.y + 12, s.width - 12, s.height - 24);
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x + 14, s.y + 20, s.width - 28, s.height - 40);
    ctx.restore();
  }

  // INTRO / HOOK CARD (0..1.5s)
  if (tSec < INTRO_SEC) {
    const p = Math.min(1, tSec / INTRO_SEC);
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.35);
    BRAND.drawMark(ctx, s.x + s.width / 2, s.y + 360, 150, pal.accent);
    ctx.textAlign = "center";
    if (options.showHookCard !== false && options.hookText?.trim()) {
      if (options.topicBadge) {
        ctx.fillStyle = pal.accent;
        ctx.font = "600 24px 'Inter', sans-serif";
        ctx.fillText(options.topicBadge, s.x + s.width / 2, s.y + 490);
      }
      ctx.fillStyle = pal.text;
      ctx.font = `600 44px ${getUrduFontStack(options.urduFont ?? "noto-nastaliq")}`;
      const hookLines = wrapCanvasText(ctx, options.hookText, s.width - 80);
      hookLines.slice(0, 2).forEach((ln, idx) => {
        ctx.fillText(ln, s.x + s.width / 2, s.y + 575 + idx * 96);
      });
    } else {
      ctx.fillStyle = pal.text;
      ctx.font = "600 54px 'Cormorant Garamond', Georgia, serif";
      ctx.fillText("Istikhara  •  استخارہ", s.x + s.width / 2, s.y + 540);
      ctx.fillStyle = pal.accent;
      ctx.font = "400 28px 'Noto Nastaliq Urdu', serif";
      ctx.fillText("قرآنی آیات کے ذریعے الہٰی رہنمائی", s.x + s.width / 2, s.y + 620);
    }
    ctx.restore();
    return;
  }

  // OUTRO / END SCREEN (last 2.5s)
  const outroStart = totalDurationSec - OUTRO_SEC;
  if (tSec >= outroStart && options.showEndScreen !== false) {
    const p = Math.min(1, (tSec - outroStart) / 0.45);
    const loopFade =
      options.loopFriendly && tSec > totalDurationSec - 0.6
        ? Math.max(0.25, (totalDurationSec - tSec) / 0.6)
        : 1;
    ctx.save();
    ctx.globalAlpha = p * loopFade;
    BRAND.drawMark(ctx, s.x + s.width / 2, s.y + 140, 130, pal.accent);

    ctx.textAlign = "center";
    ctx.fillStyle = pal.text;
    ctx.font = "600 44px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("استخارہ — Istikhara", s.x + s.width / 2, s.y + 275);

    ctx.fillStyle = pal.accent;
    ctx.font = "600 26px 'Noto Nastaliq Urdu', serif";
    ctx.fillText(
      "روزانہ آیت کے لیے فالو کریں • Follow for a daily ayah",
      s.x + s.width / 2,
      s.y + 345
    );

    ctx.font = "600 28px 'Inter', sans-serif";
    ctx.fillText(
      BRAND.appUrl.replace(/^https?:\/\//, ""),
      s.x + s.width / 2,
      s.y + 405
    );

    if (options.showQr && qrImg) {
      ctx.drawImage(qrImg, s.x + s.width / 2 - 80, s.y + 445, 160, 160);
    }

    ctx.fillStyle = pal.subtext;
    ctx.font = "400 24px 'Inter', sans-serif";
    ctx.fillText(
      `تلاوت: ${getReciterName(reciter, "ur")}`,
      s.x + s.width / 2,
      s.y + 675
    );

    if (options.mode !== "urdu-tarjuma") {
      ctx.fillText(
        `تفسیر: ${options.tafsirNameUr}`,
        s.x + s.width / 2,
        s.y + 720
      );
    }

    if (options.voiceCreditUr) {
      ctx.fillText(options.voiceCreditUr, s.x + s.width / 2, s.y + 765);
    }

    if (options.photoCredit) {
      ctx.fillText(`Photo: ${options.photoCredit} (Pexels)`, s.x + s.width / 2, s.y + 810);
    }

    ctx.fillStyle = pal.subtext;
    ctx.font = "400 22px 'Noto Nastaliq Urdu', serif";
    ctx.fillText(
      "یہ آیت غور و فکر کے لیے ہے۔ مسنون استخارہ دو رکعت نماز اور دعا ہے۔",
      s.x + s.width / 2,
      s.y + 910
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
    const arFontStack = getArabicFontStack(
      options.script ?? "indopak",
      options.arabicFont
    );
    const urFontStack = getUrduFontStack(options.urduFont ?? "noto-nastaliq");
    const relMs = Math.max(0, (tSec - active.ayahStartSec) * 1000);
    const pointerState = computePointerState(
      active.wordBoxes,
      active.wordTimings,
      relMs
    );
    const activeWordIdx = pointerState?.activeWordIndex ?? -1;

    // 2. Surah header + Range badge ("آیت 1/3")
    const cleanSurahAr = active.ayah.surahNameAr.replace(/^س[\u064B-\u065F\u0670]*و[\u064B-\u065F\u0670]*ر[\u064B-\u065F\u0670]*ة[\u064B-\u065F\u0670]*\s*/, "");
    if (options.showSurahHeader && options.showReference !== false) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = pal.accent;
      ctx.font = "600 26px 'Inter', sans-serif";
      const rangeBadge =
        (active.totalAyahs ?? 1) > 1
          ? `  •  آیت ${(active.ayahIndex ?? 0) + 1}/${active.totalAyahs}`
          : "";
      ctx.fillText(
        `سورۃ ${cleanSurahAr} • ${active.ayah.surahNameEn} • ${active.ayah.surahNumber}:${active.ayah.ayahNumber}${rangeBadge}`,
        s.x + s.width / 2,
        s.y + 115
      );
      ctx.restore();
    }

    // Gentle 1.03 zoom-in & page transition (fade / slide_up / ink_wipe)
    const pageElapsed = Math.max(0, tSec - active.startSec);
    const trP = Math.min(1, pageElapsed / 0.35);
    const zoomScale = 1 + 0.03 * Math.min(1, pageElapsed / 0.6);
    ctx.save();
    if (options.transition === "slide_up" && trP < 1) {
      ctx.translate(0, (1 - trP) * 26);
      ctx.globalAlpha = trP;
    } else if (options.transition === "fade" && trP < 1) {
      ctx.globalAlpha = trP;
    }
    ctx.translate(s.x + s.width / 2, s.y + 420);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-(s.x + s.width / 2), -(s.y + 420));

    // Kinetic Focus mode: one large Arabic word centered + Urdu meaning below
    if (options.kineticSingleWord && active.wordBoxes.length > 0) {
      const box =
        active.wordBoxes.find((b) => b.index === activeWordIdx) ??
        active.wordBoxes[0];
      ctx.save();
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.font = `400 88px ${arFontStack}`;
      ctx.fillStyle = pal.accent;
      ctx.shadowColor = autoC.textShadow;
      ctx.shadowBlur = 14;
      ctx.fillText(box.text, s.x + s.width / 2, s.y + 420);
      if (box.meaningUr) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = pal.text;
        ctx.font = `400 34px ${urFontStack}`;
        ctx.fillText(box.meaningUr, s.x + s.width / 2, s.y + 520);
      }
      ctx.restore();
      ctx.restore(); // zoom
      return;
    }

    const handMode =
      options.handStyle ??
      (options.pointerStyle === "off"
        ? "off"
        : options.pointerStyle === "glow"
          ? "highlight_only"
          : "finger_pointer");

    // 3. Word-by-word Write-on (Doodle / Qalam) OR Finger Pointer OR Highlight
    if (
      (handMode === "doodle_write" || handMode === "qalam_write") &&
      active.wordBoxes.length > 0
    ) {
      let activePen: { penX: number; penY: number } | null = null;
      let liftPx = 0;
      let wobbleDeg = 0;

      for (const box of active.wordBoxes) {
        const timing = active.wordTimings[box.index];
        const wStart = timing ? timing[1] : 0;
        const wEnd = timing ? Math.max(wStart + 180, timing[2]) : wStart + 260;

        if (relMs < wStart) continue; // not yet written

        const wordProgress = Math.min(1, (relMs - wStart) / Math.max(180, wEnd - wStart));
        const shaped = getCachedShapedWord(box.text, options.script ?? "indopak");
        const res = drawWriteOnWord(ctx, shaped, box, wordProgress, {
          fontFamily: arFontStack,
          fontSize: active.arabicFontSize,
          strokeColor: options.chalkTexture ? "#FFFDF8" : pal.accent,
          fillColor: pal.text,
          chalk: options.chalkTexture,
        });

        if (wordProgress < 1) {
          activePen = res;
          wobbleDeg = Math.sin(relMs / 55) * 1.5;
          liftPx = wordProgress > 0.92 ? -6 * ((wordProgress - 0.92) / 0.08) : 0;
        }
      }

      if (activePen) {
        drawHandSprite(ctx, {
          assetId:
            options.handAsset ??
            (handMode === "qalam_write" ? "qalam" : "marker"),
          renderStyle: options.handRenderStyle ?? "illustrated",
          skinTone: options.handSkinTone ?? "medium",
          sleeveColor: options.handSleeveColor ?? "#0B3D2E",
          penX: activePen.penX,
          penY: activePen.penY,
          wobbleDeg,
          liftPx,
          scale: options.handScale ?? 1,
          inkColor: pal.accent,
          customHandImg: extras?.customHandImg,
          customHand: extras?.customHand,
        });
      }
    } else if (active.wordBoxes.length > 0 && handMode !== "off") {
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

      if (pointerState && handMode === "finger_pointer") {
        const activeBox = active.wordBoxes.find(
          (b) => b.index === pointerState.activeWordIndex
        );
        drawPointer(
          ctx,
          options.pointerStyle ?? "hand",
          pointerState,
          activeBox,
          pal.accent
        );
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

    ctx.restore(); // end zoom/transition transform

    // Hand-drawn doodle bracket under Arabic for Whiteboard Doodle
    if (options.doodleBrackets && !active.compactHeaderOnly) {
      ctx.save();
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x + 120, s.y + 604);
      ctx.quadraticCurveTo(s.x + s.width / 2, s.y + 626, s.x + s.width - 120, s.y + 604);
      ctx.stroke();
      ctx.restore();
    }

    if (
      !active.compactHeaderOnly &&
      !active.hideFullTranslation &&
      options.languageDisplay !== "ar_only"
    ) {
      // 4. Divider
      const divY = s.y + 620;
      ctx.save();
      ctx.strokeStyle = pal.divider;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x + 180, divY);
      ctx.lineTo(s.x + s.width - 180, divY);
      ctx.stroke();
      ctx.restore();

      // 5. Urdu/English captions with 5 Caption Styles
      const activeCue =
        active.cues.find((c) => tSec >= c.startSec && tSec <= c.endSec) ??
        active.cues[0];
      const capStyle = options.captionStyle ?? "boxed";
      const showUr = options.languageDisplay !== "ar_en";
      const showEn =
        options.languageDisplay === "ar_en" || options.languageDisplay === "ar_both";

      if (activeCue && showUr) {
        ctx.save();
        if (capStyle === "boxed") {
          ctx.fillStyle = pal.panel;
          ctx.fillRect(s.x + 16, s.y + 660, s.width - 32, 340);
          ctx.strokeStyle = pal.divider;
          ctx.lineWidth = 1;
          ctx.strokeRect(s.x + 16, s.y + 660, s.width - 32, 340);
        }

        ctx.direction = "rtl";
        ctx.textAlign = "center";
        ctx.fillStyle = capStyle === "spoken_highlight" ? pal.accent : pal.text;
        const capFont =
          capStyle === "handwritten" ? getUrduFontStack("gulzar") : urFontStack;
        ctx.font = `400 ${active.urduFontSize}px ${capFont}`;
        const wrapped = wrapCanvasText(ctx, activeCue.text, s.width - 80);
        const urLineH = active.urduFontSize * NASTALIQ_LINE_HEIGHT;
        wrapped.slice(0, 4).forEach((line, idx) => {
          const ly = s.y + 720 + NASTALIQ_TOP_PADDING + idx * urLineH;
          if (capStyle === "outline") {
            ctx.lineWidth = 5;
            ctx.strokeStyle = autoC.textShadow;
            ctx.strokeText(line, s.x + s.width / 2, ly);
          }
          ctx.fillText(line, s.x + s.width / 2, ly);
        });
        ctx.restore();
      }

      if (showEn) {
        ctx.save();
        ctx.direction = "ltr";
        ctx.textAlign = "center";
        ctx.fillStyle = pal.subtext;
        ctx.font = "400 24px 'Inter', sans-serif";
        const enLines = wrapCanvasText(ctx, active.ayah.englishText, s.width - 96);
        const enStartY = showUr ? s.y + 1020 : s.y + 720;
        enLines.slice(0, 3).forEach((line, idx) => {
          ctx.fillText(line, s.x + s.width / 2, enStartY + idx * 34);
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
