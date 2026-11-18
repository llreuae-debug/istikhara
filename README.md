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

For production monetization & store badges, configure:
- `VITE_ADMOB_APP_ID_ANDROID`, `VITE_ADMOB_APP_ID_IOS`
- `VITE_ADMOB_BANNER_ANDROID`, `VITE_ADMOB_BANNER_IOS`
- `VITE_ADMOB_INTERSTITIAL_ANDROID`, `VITE_ADMOB_INTERSTITIAL_IOS`
- `VITE_ADMOB_REWARDED_ANDROID`, `VITE_ADMOB_REWARDED_IOS`
- `VITE_ADMOB_APP_OPEN_ANDROID`, `VITE_ADMOB_APP_OPEN_IOS`
- `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT_*`
- `VITE_PLAY_STORE_URL`, `VITE_APP_STORE_URL`, `VITE_IOS_APP_ID`

*(In development, Google's official AdMob test IDs are used automatically.)*

## Native Apps (Capacitor Android & iOS)

1. Build & sync web assets into the native projects:
   ```bash
   npm run build
   npx cap sync
   ```
2. **Android Release AAB**:
   - Create a release keystore (`keytool -genkey -v -keystore istikhara-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias istikhara`) and configure `android/keystore.properties`.
   - Build the signed App Bundle:
     ```bash
     cd android
     ./gradlew bundleRelease
     ```
   - Output: `android/app/build/outputs/bundle/release/app-release.aab`.
   - Upload to Google Play Console (`com.istikhara.app`).
3. **iOS Release (Xcode / Codemagic)**:
   - Open `ios/App/App.xcworkspace` in Xcode (or use the included `codemagic.yaml` CI workflow for macOS cloud builds).
   - Set your Apple Developer Team, Provisioning Profile, and Bundle ID (`com.istikhara.app`).
   - Archive & upload via Xcode Organizer or `codemagic.yaml`.

## AdMob Console Pre-Launch Checklist

1. **Content Rating**: Set AdMob max ad content rating to **G (General Audiences)** in AdMob Console (and enforced in code via `MaxAdContentRating.General`).
2. **Sensitive Categories Blocking**: In AdMob Console → Blocking controls, block Gambling & Betting, Alcohol, Dating, Politics, Religion-sensitive ads, and Mature/Sexual content.
3. **Privacy & Messaging (UMP)**: Create and publish a GDPR + US States consent message in AdMob Privacy & Messaging linked to both Android and iOS apps.
4. **app-ads.txt**: Update `VITE_ADMOB_PUBLISHER_ID` and run `npm run generate:ads-txt` so `public/app-ads.txt` and `public/ads.txt` are live at your domain root.
5. **Deep Links**: Replace placeholder SHA-256 fingerprint in `public/.well-known/assetlinks.json` and Apple Team ID in `public/.well-known/apple-app-site-association`.
