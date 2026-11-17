# Istikhara — استخارہ

**قرآنی آیات کے ذریعے الہٰی رہنمائی** · *Receive divine guidance through Quranic verse*

A calm, ad-free, privacy-first, offline-capable PWA for performing the Sunnah Istikhara and reflecting on Quranic verses in Urdu and English.

## Features

- **Zero hardcoded Quran text**: All Arabic (`quran-uthmani`), Urdu (`ur.jalandhry`), English (`en.sahih`), and audio recitations (`ar.alafasy`, `ar.abdulbasitmurattal`, `ar.husary`) are fetched from the [Al-Quran Cloud API](https://alquran.cloud/api).
- **Sunnah Istikhara Flow**:
  - `/` — Home with animated Rub el Hizb logo, Hijri & Gregorian dates, Urdu/English toggle
  - `/prepare` — 3-step preparation (wudu & 2 rak'ahs reminder, Sahih al-Bukhari 1162 dua with interactive `هَذَا الْأَمْرَ` highlight, optional device-only intention)
  - `/focus` — Dimmed breathing gold ring + 3-tap / 3-second hold tasbih bead with haptic feedback
  - `/result` — Manuscript-reveal verse card with audio, Tafsir link, A4 PDF export, 1080×1350 & 1080×1920 share images + QR code
  - `/ayah/:surah/:ayah` — Shareable deep link
  - `/guide` — Illustrated 5-step Sunnah method & bilingual FAQ
  - `/history` — Private verse history, saved bookmarks, reflection journal, JSON export
  - `/daily` — Deterministic Verse of the Day
  - `/settings` — Language (`اردو` / `English` / `both`), theme (`dark` / `light` / `auto`), Arabic font size, reciter, selection mode (`Full Quran` vs `Reflection Set`), haptics, animations, and one-tap offline Quran download
  - `/about` — Data sources & privacy statement

## Local Development

```bash
npm install
npm run icons   # (optional) regenerate PNG icons, favicon.ico, and og-image.png
npm run dev     # starts Vite on http://localhost:5001 (LAN-accessible)
```

## Type Check & Production Build

```bash
npm run check
npm run build
```

The static build outputs to `dist/` and can be deployed directly to **Vercel**, **Netlify**, or **Firebase Hosting** with SPA fallback to `index.html`.

## Environment Variables

Set `VITE_APP_URL` in `.env` (defaults to `window.location.origin` if unset) for QR codes and share links.
