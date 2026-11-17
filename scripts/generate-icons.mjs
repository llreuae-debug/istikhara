import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const iconsDir = path.join(publicDir, "icons");

fs.mkdirSync(iconsDir, { recursive: true });

function makeIconSvg(size, paddingRatio = 0.14) {
  const box = size * (1 - paddingRatio * 2);
  const offset = (size - box) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = Math.max(2, size * 0.022);
  const bookW = box * 0.42;
  const bookY = cy + box * 0.12;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B3D2E" />
        <stop offset="100%" stop-color="#0A1A2F" />
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E6CF7A" stop-opacity="1" />
        <stop offset="50%" stop-color="#C9A227" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#C9A227" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg)" />
    <rect x="${offset}" y="${offset}" width="${box}" height="${box}" stroke="#C9A227" stroke-width="${stroke}" />
    <rect x="${offset}" y="${offset}" width="${box}" height="${box}" stroke="#C9A227" stroke-width="${stroke}" transform="rotate(45 ${cx} ${cy})" />
    <path d="M ${cx - bookW} ${bookY} C ${cx - bookW * 0.5} ${bookY - box * 0.08}, ${cx - bookW * 0.2} ${bookY - box * 0.08}, ${cx} ${bookY} C ${cx + bookW * 0.2} ${bookY - box * 0.08}, ${cx + bookW * 0.5} ${bookY - box * 0.08}, ${cx + bookW} ${bookY}" stroke="#C9A227" stroke-width="${stroke * 1.15}" stroke-linecap="round" />
    <circle cx="${cx}" cy="${cy - box * 0.12}" r="${box * 0.14}" fill="url(#glow)" />
    <circle cx="${cx}" cy="${cy - box * 0.12}" r="${box * 0.045}" fill="#E6CF7A" />
  </svg>`;
}

function makeFaviconSvg(size) {
  const pad = size * 0.18;
  const box = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = Math.max(1.5, size * 0.065);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0A1A2F" />
    <rect x="${pad}" y="${pad}" width="${box}" height="${box}" stroke="#C9A227" stroke-width="${stroke}" />
    <rect x="${pad}" y="${pad}" width="${box}" height="${box}" stroke="#C9A227" stroke-width="${stroke}" transform="rotate(45 ${cx} ${cy})" />
    <circle cx="${cx}" cy="${cy}" r="${Math.max(2, size * 0.08)}" fill="#E6CF7A" />
  </svg>`;
}

function buildIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngBuffers.length, 4);

  const entries = [];
  let offset = 6 + pngBuffers.length * 16;

  for (const { size, buf } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buf)]);
}

async function main() {
  await sharp(Buffer.from(makeIconSvg(180, 0.16)))
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  await sharp(Buffer.from(makeIconSvg(192, 0.16)))
    .png()
    .toFile(path.join(iconsDir, "icon-192.png"));

  await sharp(Buffer.from(makeIconSvg(512, 0.16)))
    .png()
    .toFile(path.join(iconsDir, "icon-512.png"));

  // Maskable safe-zone: inner 64%
  await sharp(Buffer.from(makeIconSvg(512, 0.24)))
    .png()
    .toFile(path.join(iconsDir, "maskable-512.png"));

  // Multi-resolution favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const size of icoSizes) {
    const buf = await sharp(Buffer.from(makeFaviconSvg(size))).png().toBuffer();
    pngBuffers.push({ size, buf });
  }
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), buildIco(pngBuffers));

  // OG Image 1200x630
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
    <defs>
      <radialGradient id="ogBg" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stop-color="#0B3D2E" />
        <stop offset="100%" stop-color="#0A1A2F" />
      </radialGradient>
      <radialGradient id="ogGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E6CF7A" stop-opacity="0.95" />
        <stop offset="55%" stop-color="#C9A227" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#C9A227" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#ogBg)" />
    <rect x="32" y="32" width="1136" height="566" rx="18" stroke="#C9A227" stroke-opacity="0.35" stroke-width="2" />
    <rect x="44" y="44" width="1112" height="542" rx="12" stroke="#C9A227" stroke-opacity="0.18" stroke-width="1" />
    <g transform="translate(520, 110)">
      <rect x="26" y="26" width="108" height="108" stroke="#C9A227" stroke-width="2.5" />
      <rect x="26" y="26" width="108" height="108" stroke="#C9A227" stroke-width="2.5" transform="rotate(45 80 80)" />
      <path d="M48 92 C58 84, 70 84, 80 92 C90 84, 102 84, 112 92" stroke="#C9A227" stroke-width="2.8" stroke-linecap="round" />
      <circle cx="80" cy="64" r="18" fill="url(#ogGlow)" />
      <circle cx="80" cy="64" r="4.5" fill="#E6CF7A" />
    </g>
    <text x="600" y="345" text-anchor="middle" fill="#F7F1E3" font-family="Georgia, serif" font-size="72" font-weight="600" letter-spacing="3">Istikhara</text>
    <text x="600" y="425" text-anchor="middle" fill="#E6CF7A" font-family="sans-serif" font-size="28">Receive divine guidance through Quranic verse</text>
    <text x="600" y="490" text-anchor="middle" fill="#F7F1E3" fill-opacity="0.72" font-family="sans-serif" font-size="20">Sunnah Dua • Al-Quran Cloud • Private &amp; Offline-Ready</text>
  </svg>`;
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(publicDir, "og-image.png"));

  console.log("Generated icons, favicon.ico, apple-touch-icon.png, and og-image.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
