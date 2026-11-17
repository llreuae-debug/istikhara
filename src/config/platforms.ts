export type PlatformPresetId =
  | "reels"
  | "whatsapp_status"
  | "feed_4_5"
  | "square"
  | "youtube_16_9";

export interface SafeZoneMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PlatformPreset {
  id: PlatformPresetId;
  labelEn: string;
  labelUr: string;
  width: number;
  height: number;
  safeZone: SafeZoneMargins;
  maxDurationSec: number;
  captionLimit: number;
  maxHashtags: number;
  linkInBioHint: boolean;
  ghostUiType: "vertical_social" | "whatsapp" | "feed" | "square" | "landscape";
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "reels",
    labelEn: "Reels / TikTok / Shorts (9:16)",
    labelUr: "ریلز / ٹک ٹاک / شارٹس (9:16)",
    width: 1080,
    height: 1920,
    safeZone: { top: 220, bottom: 420, left: 60, right: 140 },
    maxDurationSec: 90,
    captionLimit: 2200,
    maxHashtags: 10,
    linkInBioHint: true,
    ghostUiType: "vertical_social",
  },
  {
    id: "whatsapp_status",
    labelEn: "WhatsApp Status (9:16)",
    labelUr: "واٹس ایپ اسٹیٹس (9:16)",
    width: 1080,
    height: 1920,
    safeZone: { top: 200, bottom: 260, left: 60, right: 60 },
    maxDurationSec: 30,
    captionLimit: 700,
    maxHashtags: 5,
    linkInBioHint: false,
    ghostUiType: "whatsapp",
  },
  {
    id: "feed_4_5",
    labelEn: "Instagram / Facebook Feed (4:5)",
    labelUr: "انسٹاگرام / فیس بک فیڈ (4:5)",
    width: 1080,
    height: 1350,
    safeZone: { top: 60, bottom: 60, left: 80, right: 80 },
    maxDurationSec: 60,
    captionLimit: 2200,
    maxHashtags: 10,
    linkInBioHint: true,
    ghostUiType: "feed",
  },
  {
    id: "square",
    labelEn: "Square (1:1)",
    labelUr: "مربع (1:1)",
    width: 1080,
    height: 1080,
    safeZone: { top: 60, bottom: 60, left: 60, right: 60 },
    maxDurationSec: 60,
    captionLimit: 2200,
    maxHashtags: 10,
    linkInBioHint: false,
    ghostUiType: "square",
  },
  {
    id: "youtube_16_9",
    labelEn: "YouTube / Facebook (16:9)",
    labelUr: "یوٹیوب / فیس بک (16:9)",
    width: 1920,
    height: 1080,
    safeZone: { top: 54, bottom: 54, left: 96, right: 96 },
    maxDurationSec: 180,
    captionLimit: 5000,
    maxHashtags: 15,
    linkInBioHint: false,
    ghostUiType: "landscape",
  },
];

export function getSafeBox(preset: PlatformPreset) {
  return {
    x: preset.safeZone.left,
    y: preset.safeZone.top,
    width: preset.width - preset.safeZone.left - preset.safeZone.right,
    height: preset.height - preset.safeZone.top - preset.safeZone.bottom,
  };
}
