import QRCode from "qrcode";
import type { FetchedAyah } from "./quranApi";

export type ShareImageFormat = "post" | "story";

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateShareImageBlob(
  ayah: FetchedAyah,
  format: ShareImageFormat,
  lang: "ur" | "en",
  appUrl: string
): Promise<Blob> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const width = 1080;
  const height = format === "post" ? 1350 : 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unsupported");

  // Midnight -> Emerald radial background
  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.38,
    40,
    width * 0.5,
    height * 0.5,
    height * 0.72
  );
  grad.addColorStop(0, "#0B3D2E");
  grad.addColorStop(1, "#0A1A2F");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Ornamental gold frame
  ctx.strokeStyle = "rgba(201, 162, 39, 0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, width - 88, height - 88);
  ctx.strokeStyle = "rgba(201, 162, 39, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Top Rub el Hizb emblem
  const logoY = format === "post" ? 135 : 190;
  ctx.save();
  ctx.translate(width / 2, logoY);
  ctx.strokeStyle = "#C9A227";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-26, -26, 52, 52);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-26, -26, 52, 52);
  ctx.restore();

  ctx.fillStyle = "#E6CF7A";
  ctx.beginPath();
  ctx.arc(width / 2, logoY, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Reference header
  ctx.textAlign = "center";
  ctx.fillStyle = "#E6CF7A";
  ctx.font = "600 30px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText(
    `${ayah.surahNameEn}  •  ${ayah.surahNumber}:${ayah.ayahNumber}`,
    width / 2,
    logoY + 86
  );

  // Arabic verse
  const maxTextW = width - 190;
  ctx.fillStyle = "#F7F1E3";
  ctx.direction = "rtl";
  ctx.font = "400 54px 'Amiri Quran', 'Amiri', serif";
  const arabicWithMarker = `${ayah.arabicText} ﴿${ayah.ayahNumber}﴾`;
  const arLines = wrapTextLines(ctx, arabicWithMarker, maxTextW);
  let cursorY = format === "post" ? 360 : 480;
  for (const line of arLines.slice(0, 7)) {
    ctx.fillText(line, width / 2, cursorY);
    cursorY += 92;
  }

  // Divider line
  cursorY += 20;
  ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.32, cursorY);
  ctx.lineTo(width * 0.68, cursorY);
  ctx.stroke();

  // Translation (never include private intention note)
  cursorY += 72;
  if (lang === "ur") {
    ctx.direction = "rtl";
    ctx.fillStyle = "rgba(247, 241, 227, 0.9)";
    ctx.font = "400 34px 'Noto Nastaliq Urdu', serif";
    const urLines = wrapTextLines(ctx, ayah.urduText, maxTextW);
    for (const line of urLines.slice(0, 6)) {
      ctx.fillText(line, width / 2, cursorY);
      cursorY += 76;
    }
  } else {
    ctx.direction = "ltr";
    ctx.fillStyle = "rgba(247, 241, 227, 0.9)";
    ctx.font = "400 32px 'Inter', sans-serif";
    const enLines = wrapTextLines(ctx, ayah.englishText, maxTextW);
    for (const line of enLines.slice(0, 7)) {
      ctx.fillText(line, width / 2, cursorY);
      cursorY += 50;
    }
  }

  // Footer with QR code & app link
  const shareUrl = `${appUrl}/ayah/${ayah.surahNumber}/${ayah.ayahNumber}`;
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 140,
    margin: 1,
    color: { dark: "#0A1A2F", light: "#F7F1E3" },
  });
  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  const footerY = height - 190;
  ctx.drawImage(qrImg, width - 220, footerY - 25, 130, 130);

  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.fillStyle = "#E6CF7A";
  ctx.font = "600 36px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText("Istikhara  •  استخارہ", 96, footerY + 28);

  ctx.fillStyle = "rgba(247, 241, 227, 0.72)";
  ctx.font = "400 22px 'Inter', sans-serif";
  ctx.fillText(shareUrl, 96, footerY + 68);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export image"));
    }, "image/png");
  });
}
