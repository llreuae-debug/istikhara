# Google Play Data Safety Declaration — Istikhara (`com.istikhara.app`)

Use these exact answers when filling out the **Data safety** form in Google Play Console.

## Overview
- **Does your app collect or share any of the required user data types?** Yes (only when AdMob / UMP consent is active for advertising/analytics).
- **Is all of the user data collected by your app encrypted in transit?** Yes (HTTPS/TLS for Al-Quran Cloud API, Tafsir links, and Google Mobile Ads SDK).
- **Do you provide a way for users to request that their data is deleted?** Yes — personal intention notes, reflection journals, and bookmarks are stored *only locally* on the device (`localStorage`/Preferences) and can be cleared in Settings/History or by uninstalling. Advertising consent can be reset in **Settings → Privacy & Ad Choices**.

## Data Types Collected / Shared (via Google Mobile Ads SDK / AdMob)
| Category | Data Type | Collected | Shared | Ephemeral | Purpose |
|---|---|---|---|---|---|
| **Device or other IDs** | Device or other IDs (Advertising ID / App Set ID) | Yes | Yes (with Google AdMob) | No | Advertising or marketing, Fraud prevention, security, and compliance |
| **App activity** | App interactions (ad impressions, clicks) | Yes | Yes (with Google AdMob) | No | Advertising or marketing, Analytics |
| **App info and performance** | Diagnostics (ad SDK crash/latency) | Yes | Yes (with Google AdMob) | No | Analytics, Fraud prevention |
| **Location** | Approximate location (IP-derived by AdMob) | Yes | Yes (with Google AdMob) | Yes | Advertising or marketing |

## Data NOT Collected
- **Personal info** (Name, Email, Phone, Address): **Not collected** (no login/account).
- **Messages / Photos / Audio / Files**: **Not collected**. Audio recitations are streamed/cached from Al-Quran Cloud; exported PDFs/MP4s/images stay on the user's device.
- **Intention Note & Reflection Journal**: **Stored strictly on-device**; never transmitted to any server, URL, or ad SDK.
