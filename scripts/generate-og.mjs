import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const OUT_DIR = path.resolve("public/og");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Load self-hosted Inter font from @fontsource/inter
const fontPath = path.resolve(
  "node_modules/@fontsource/inter/files/inter-latin-600-normal.woff"
);
const fontData = fs.readFileSync(fontPath);

const APP_URL =
  process.env.VITE_APP_URL || "https://istikhara-quran-app.netlify.app";

const PAGES = [
  { key: "home", titleEn: "Istikhara — Guidance Through Quranic Verse" },
  { key: "prepare", titleEn: "Prepare for Istikhara — Wudu & Dua" },
  { key: "guide", titleEn: "How to Perform Istikhara (Sunnah Method)" },
  { key: "dua", titleEn: "Istikhara Dua — Sahih al-Bukhari 1162" },
  { key: "daily", titleEn: "Verse of the Day — Daily Reflection" },
  { key: "studio", titleEn: "Quran Verse Video Studio (MP4)" },
  { key: "verses", titleEn: "40 Quranic Verses for Trust & Patience" },
  { key: "faq", titleEn: "Istikhara FAQ — Common Questions" },
  { key: "istikhara-for-marriage", titleEn: "Istikhara for Marriage" },
  { key: "istikhara-for-business", titleEn: "Istikhara for Business" },
  { key: "istikhara-for-job", titleEn: "Istikhara for a Job & Career" },
  { key: "after-istikhara", titleEn: "What to Do After Istikhara" },
  { key: "misconceptions", titleEn: "Common Misconceptions About Istikhara" },
  { key: "quran-and-istikhara", titleEn: "Quranic Verses and Istikhara" },
];

async function renderOg(title, outPath) {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
          background: "radial-gradient(circle at 50% 30%, #0B3D2E 0%, #0A1A2F 75%)",
          color: "#F7F1E3",
          border: "4px solid rgba(201,162,39,0.5)",
          fontFamily: "Inter",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "18px",
                color: "#E6CF7A",
                fontSize: "28px",
                fontWeight: 600,
              },
              children: ["✦  Istikhara"],
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "54px",
                fontWeight: 600,
                lineHeight: 1.2,
                color: "#F7F1E3",
              },
              children: [title],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                fontSize: "22px",
                color: "rgba(247,241,227,0.72)",
              },
              children: [
                "Sunnah Istikhara • Al-Quran Cloud • Private & Offline",
                APP_URL.replace(/^https?:\/\//, ""),
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Inter", data: fontData, weight: 600, style: "normal" }],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();
  fs.writeFileSync(outPath, png);
}

async function main() {
  for (const page of PAGES) {
    for (const lang of ["ur", "en"]) {
      await renderOg(page.titleEn, path.join(OUT_DIR, `${page.key}-${lang}.png`));
    }
  }
  console.log(`Generated ${PAGES.length * 2} OG PNGs in /public/og/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
