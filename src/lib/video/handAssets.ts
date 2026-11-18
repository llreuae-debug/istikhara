export type HandStyleMode =
  | "doodle_write"
  | "qalam_write"
  | "finger_pointer"
  | "highlight_only"
  | "off";

export type HandAssetId = "marker" | "qalam" | "ink_pen" | "finger";
export type HandRenderStyle = "line_art" | "illustrated";
export type HandSkinTone = "light" | "medium" | "deep";

export interface CustomHandConfig {
  dataUrl: string;
  /** Normalized 0..1 anchor within uploaded PNG */
  tipX: number;
  tipY: number;
  scale: number;
  rotationDeg: number;
}

const SKIN_TONES: Record<HandSkinTone, { fill: string; shade: string }> = {
  light: { fill: "#F3D3B8", shade: "#DFB292" },
  medium: { fill: "#D4A17A", shade: "#B9825B" },
  deep: { fill: "#8D5A3B", shade: "#6F4329" },
};

const CUSTOM_HAND_KEY = "istikhara:custom-hand:v1";

export function loadCustomHand(): CustomHandConfig | null {
  try {
    const raw = localStorage.getItem(CUSTOM_HAND_KEY);
    return raw ? (JSON.parse(raw) as CustomHandConfig) : null;
  } catch {
    return null;
  }
}

export function saveCustomHand(cfg: CustomHandConfig | null): void {
  try {
    if (!cfg) localStorage.removeItem(CUSTOM_HAND_KEY);
    else localStorage.setItem(CUSTOM_HAND_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

/**
 * Draws an original vector hand sprite (or user-uploaded transparent PNG)
 * anchored strictly at its pen/finger tip (penX, penY).
 */
export function drawHandSprite(
  ctx: CanvasRenderingContext2D,
  params: {
    assetId: HandAssetId;
    renderStyle: HandRenderStyle;
    skinTone: HandSkinTone;
    sleeveColor: string;
    penX: number;
    penY: number;
    wobbleDeg?: number;
    liftPx?: number;
    scale?: number;
    alpha?: number;
    inkColor?: string;
    customHandImg?: HTMLImageElement | null;
    customHand?: CustomHandConfig | null;
  }
) {
  const scale = params.scale ?? 1;
  const wobbleRad = ((params.wobbleDeg ?? 0) * Math.PI) / 180;
  const liftY = params.liftPx ?? 0;

  ctx.save();
  ctx.globalAlpha = params.alpha ?? 1;
  ctx.translate(params.penX, params.penY + liftY);
  ctx.rotate(wobbleRad);
  ctx.scale(scale, scale);

  // Soft drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.32)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 8;

  // Custom uploaded PNG hand
  if (params.customHandImg && params.customHand) {
    const w = 180 * params.customHand.scale;
    const h = (params.customHandImg.height / Math.max(1, params.customHandImg.width)) * w;
    ctx.rotate((params.customHand.rotationDeg * Math.PI) / 180);
    ctx.drawImage(
      params.customHandImg,
      -params.customHand.tipX * w,
      -params.customHand.tipY * h,
      w,
      h
    );
    ctx.restore();
    return;
  }

  const skin = SKIN_TONES[params.skinTone] ?? SKIN_TONES.medium;
  const isLine = params.renderStyle === "line_art";
  const stroke = params.inkColor ?? "#C9A227";

  if (params.assetId === "finger") {
    // Tip at (0, 0) pointing up
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = isLine ? "transparent" : skin.fill;
    ctx.beginPath();
    ctx.moveTo(-6, 26);
    ctx.lineTo(-6, 6);
    ctx.arc(0, 6, 6, Math.PI, 0, false);
    ctx.lineTo(6, 26);
    ctx.quadraticCurveTo(22, 24, 24, 38);
    ctx.lineTo(24, 72);
    ctx.quadraticCurveTo(24, 86, 4, 86);
    ctx.lineTo(-14, 86);
    ctx.quadraticCurveTo(-24, 86, -24, 68);
    ctx.lineTo(-24, 40);
    ctx.quadraticCurveTo(-24, 24, -6, 26);
    ctx.closePath();
    if (!isLine) ctx.fill();
    ctx.stroke();

    if (!isLine) {
      ctx.fillStyle = params.sleeveColor;
      ctx.fillRect(-20, 82, 42, 46);
    }
    ctx.restore();
    return;
  }

  // Writing tools: tip at (0, 0), body angles down-right (+x, +y) so hand stays below & right of text
  ctx.rotate(0.28);

  // Pen / Marker / Qalam shaft
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = stroke;
  if (params.assetId === "qalam") {
    ctx.fillStyle = isLine ? "transparent" : "#B8893A";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 22);
    ctx.lineTo(14, 118);
    ctx.lineTo(-2, 118);
    ctx.lineTo(-7, 22);
    ctx.closePath();
    if (!isLine) ctx.fill();
    ctx.stroke();
  } else if (params.assetId === "marker") {
    ctx.fillStyle = isLine ? "transparent" : "#1F2937";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 16);
    ctx.lineTo(16, 120);
    ctx.lineTo(-4, 120);
    ctx.lineTo(-6, 16);
    ctx.closePath();
    if (!isLine) ctx.fill();
    ctx.stroke();
  } else {
    // ink_pen
    ctx.fillStyle = isLine ? "transparent" : "#0F172A";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, 18);
    ctx.lineTo(11, 118);
    ctx.lineTo(-3, 118);
    ctx.lineTo(-5, 18);
    ctx.closePath();
    if (!isLine) ctx.fill();
    ctx.stroke();
  }

  // Stylized holding hand & sleeve (positioned below/right of pen tip)
  ctx.fillStyle = isLine ? "transparent" : skin.fill;
  ctx.strokeStyle = stroke;
  ctx.beginPath();
  ctx.moveTo(6, 36);
  ctx.quadraticCurveTo(42, 34, 54, 62);
  ctx.lineTo(66, 108);
  ctx.lineTo(14, 118);
  ctx.quadraticCurveTo(-8, 92, -6, 62);
  ctx.quadraticCurveTo(-6, 42, 6, 36);
  ctx.closePath();
  if (!isLine) ctx.fill();
  ctx.stroke();

  if (!isLine) {
    ctx.fillStyle = params.sleeveColor;
    ctx.beginPath();
    ctx.moveTo(12, 112);
    ctx.lineTo(72, 102);
    ctx.lineTo(96, 180);
    ctx.lineTo(24, 190);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
