import fs from "node:fs";
import path from "node:path";

const APP_URL =
  process.env.VITE_APP_URL || "https://istikhara-quran-app.netlify.app";
const TODAY = new Date().toISOString().slice(0, 10);

const CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

const PUBLIC_PATHS = [
  "/",
  "/prepare",
  "/daily",
  "/studio",
  "/guide",
  "/dua",
  "/faq",
  "/verses",
  "/istikhara-for-marriage",
  "/istikhara-for-business",
  "/istikhara-for-job",
  "/after-istikhara",
  "/misconceptions",
  "/quran-and-istikhara",
  "/about",
  "/privacy",
  "/contact",
];

const REFLECTION_REFS = [
  "3:159", "65:3", "2:216", "94:5", "94:6", "13:28", "2:286", "2:153",
  "3:173", "8:2", "8:46", "9:51", "10:62", "11:88", "12:86", "12:87",
  "14:12", "16:97", "18:10", "18:24", "20:25", "20:46", "21:87", "25:74",
  "26:62", "28:24", "29:69", "33:3", "39:36", "39:53", "40:44", "42:38",
  "48:1", "57:4", "64:11", "65:2", "67:15", "73:9", "93:5", "112:1",
];

// 1. robots.txt
const robotsLines = [
  ...CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, "Allow: /", ""]),
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${APP_URL}/sitemap.xml`,
  "",
];
fs.writeFileSync(path.resolve("public/robots.txt"), robotsLines.join("\n"));

// 2. sitemap.xml with hreflang alternates
const allPaths = [
  ...PUBLIC_PATHS,
  ...REFLECTION_REFS.map((r) => `/verses/${r.replace(":", "-")}`),
];

const urlEntries = [];
for (const p of allPaths) {
  for (const lang of ["ur", "en"]) {
    const loc = `${APP_URL}/${lang}${p === "/" ? "/" : p}`;
    const urAlt = `${APP_URL}/ur${p === "/" ? "/" : p}`;
    const enAlt = `${APP_URL}/en${p === "/" ? "/" : p}`;
    urlEntries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="ur" href="${urAlt}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enAlt}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${urAlt}" />
  </url>`);
  }
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>
`;
fs.writeFileSync(path.resolve("public/sitemap.xml"), sitemapXml);

// 3. llms.txt
const llmsTxt = `# Istikhara — استخارہ

> Receive divine guidance through Quranic verse (قرآنی آیات کے ذریعے الہٰی رہنمائی).

Istikhara is a calm, ad-free, privacy-first web app for Muslims in Pakistan, India, and the diaspora. It teaches the Sunnah Istikhara (two rak'ahs and the dua from Sahih al-Bukhari 1162) and offers quiet Quranic reflection in Urdu and English using verified Al-Quran Cloud editions.

## Key Pages (Urdu & English)
- Home: ${APP_URL}/ur/ | ${APP_URL}/en/
- Sunnah Method: ${APP_URL}/ur/guide | ${APP_URL}/en/guide
- Istikhara Dua: ${APP_URL}/ur/dua | ${APP_URL}/en/dua
- Reflection Set (40 Verses): ${APP_URL}/ur/verses | ${APP_URL}/en/verses
- Verse of the Day: ${APP_URL}/ur/daily | ${APP_URL}/en/daily
- Quran Verse Video Studio: ${APP_URL}/ur/studio | ${APP_URL}/en/studio
- FAQ: ${APP_URL}/ur/faq | ${APP_URL}/en/faq
`;
fs.writeFileSync(path.resolve("public/llms.txt"), llmsTxt);

// 4. llms-full.txt (plain-text articles, linking to quran.com instead of duplicating Quran text)
const llmsFull = `# Istikhara — Full Knowledge Summary

${llmsTxt}

## Core Principles
1. Sunnah Istikhara is praying two voluntary rak'ahs and reciting the dua from Sahih al-Bukhari 1162 (https://sunnah.com/bukhari:1162).
2. Quranic verses shown in the app are strictly for reflection (tadabbur), never labeled good/bad or yes/no.
3. All Quranic text is sourced from Al-Quran Cloud (quran-uthmani, ur.jalandhry, en.sahih) and linked to https://quran.com for tafsir.
4. Zero accounts: user intentions and reflections remain strictly in browser localStorage and IndexedDB.

## Curated Reflection References (linked to Quran.com)
${REFLECTION_REFS.map((r) => `- https://quran.com/${r.replace(":", "/")}`).join("\n")}
`;
fs.writeFileSync(path.resolve("public/llms-full.txt"), llmsFull);

// 5. IndexNow key verification file
const key = "istikhara9f4c2b8a1d7e6034a912c8e7b5d4f102";
fs.writeFileSync(path.resolve(`public/${key}.txt`), key);

console.log("Generated robots.txt, sitemap.xml, llms.txt, llms-full.txt, and IndexNow key file.");
