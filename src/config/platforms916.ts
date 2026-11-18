export type Platform916Id =
  | "universal"
  | "instagram_reels"
  | "tiktok"
  | "youtube_shorts"
  | "facebook_reels"
  | "whatsapp_status"
  | "snapchat";

export interface SafeZone916 {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Platform916Preset {
  id: Platform916Id;
  labelUr: string;
  labelEn: string;
  safeZone: SafeZone916;
  maxDurationSec: number | null;
  captionLimit: number;
  linkInBioHint: boolean;
}

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

export const UNIVERSAL_SAFE_ZONE: SafeZone916 = {
  top: 250,
  bottom: 480,
  left: 60,
  right: 150,
};

export const UNIVERSAL_SAFE_BOX = {
  x: UNIVERSAL_SAFE_ZONE.left, // 60
  y: UNIVERSAL_SAFE_ZONE.top, // 250
  width: VIDEO_WIDTH - UNIVERSAL_SAFE_ZONE.left - UNIVERSAL_SAFE_ZONE.right, // 870
  height: VIDEO_HEIGHT - UNIVERSAL_SAFE_ZONE.top - UNIVERSAL_SAFE_ZONE.bottom, // 1190
};

export const PLATFORMS_916: Platform916Preset[] = [
  {
    id: "universal",
    labelUr: "یونیورسل (تمام پلیٹ فارمز)",
    labelEn: "Universal (All Platforms)",
    safeZone: UNIVERSAL_SAFE_ZONE,
    maxDurationSec: null,
    captionLimit: 2200,
    linkInBioHint: false,
  },
  {
    id: "instagram_reels",
    labelUr: "انسٹاگرام ریلز",
    labelEn: "Instagram Reels",
    safeZone: { top: 250, bottom: 450, left: 60, right: 140 },
    maxDurationSec: 180,
    captionLimit: 2200,
    linkInBioHint: true,
  },
  {
    id: "tiktok",
    labelUr: "ٹک ٹاک",
    labelEn: "TikTok",
    safeZone: { top: 160, bottom: 480, left: 60, right: 150 },
    maxDurationSec: 600,
    captionLimit: 2200,
    linkInBioHint: true,
  },
  {
    id: "youtube_shorts",
    labelUr: "یوٹیوب شارٹس",
    labelEn: "YouTube Shorts",
    safeZone: { top: 200, bottom: 400, left: 60, right: 140 },
    maxDurationSec: 180,
    captionLimit: 5000,
    linkInBioHint: false,
  },
  {
    id: "facebook_reels",
    labelUr: "فیس بک ریلز",
    labelEn: "Facebook Reels",
    safeZone: { top: 250, bottom: 450, left: 60, right: 140 },
    maxDurationSec: 90,
    captionLimit: 2200,
    linkInBioHint: false,
  },
  {
    id: "whatsapp_status",
    labelUr: "واٹس ایپ اسٹیٹس",
    labelEn: "WhatsApp Status",
    safeZone: { top: 200, bottom: 260, left: 60, right: 60 },
    maxDurationSec: 60,
    captionLimit: 700,
    linkInBioHint: false,
  },
  {
    id: "snapchat",
    labelUr: "اسنیپ چیٹ",
    labelEn: "Snapchat",
    safeZone: { top: 200, bottom: 360, left: 60, right: 60 },
    maxDurationSec: 60,
    captionLimit: 250,
    linkInBioHint: false,
  },
];

export function getPlatform916(id: Platform916Id): Platform916Preset {
  return PLATFORMS_916.find((p) => p.id === id) ?? PLATFORMS_916[0];
}
