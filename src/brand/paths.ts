export const BRAND_COLORS = {
  midnight: "#0A1A2F",
  emerald: "#0B3D2E",
  emeraldLight: "#14614A",
  gold: "#C9A227",
  goldSoft: "#E6CF7A",
  ivory: "#F7F1E3",
  ink: "#1B1B1B",
} as const;

export const LOGO_PATHS = {
  viewBox: "0 0 120 120",
  square: { x: 26, y: 26, width: 68, height: 68 },
  bookPrimary: "M40 69 C47 64, 54 64, 60 69 C66 64, 73 64, 80 69",
  bookSecondary: "M40 74 C47 69, 54 69, 60 74 C66 69, 73 69, 80 74",
  lightPoint: { cx: 60, cy: 48, r: 3.2, glowR: 11 },
} as const;

export function drawBrandMarkOnCanvas(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = BRAND_COLORS.gold
) {
  const scale = size / 120;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Two overlapping squares (Rub el Hizb)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(-34, -34, 68, 68);
  ctx.save();
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-34, -34, 68, 68);
  ctx.restore();

  // Open book two curved strokes
  ctx.lineCap = "round";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-20, 9);
  ctx.bezierCurveTo(-13, 4, -6, 4, 0, 9);
  ctx.bezierCurveTo(6, 4, 13, 4, 20, 9);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.globalAlpha *= 0.72;
  ctx.beginPath();
  ctx.moveTo(-20, 14);
  ctx.bezierCurveTo(-13, 9, -6, 9, 0, 14);
  ctx.bezierCurveTo(6, 9, 13, 9, 20, 14);
  ctx.stroke();

  // Point of light with soft glow
  ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(0, -12, 1, 0, -12, 12);
  glow.addColorStop(0, BRAND_COLORS.goldSoft);
  glow.addColorStop(0.5, "rgba(201, 162, 39, 0.45)");
  glow.addColorStop(1, "rgba(201, 162, 39, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, -12, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = BRAND_COLORS.goldSoft;
  ctx.beginPath();
  ctx.arc(0, -12, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
