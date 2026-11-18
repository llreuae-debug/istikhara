const IS_DEV =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

export const ADMOB_TEST_IDS = {
  android: {
    appId: "ca-app-pub-3940256099942544~3347511713",
    banner: "ca-app-pub-3940256099942544/9214589741",
    interstitial: "ca-app-pub-3940256099942544/1033173712",
    rewarded: "ca-app-pub-3940256099942544/5224354917",
    appOpen: "ca-app-pub-3940256099942544/9257395921",
    native: "ca-app-pub-3940256099942544/2247696110",
  },
  ios: {
    appId: "ca-app-pub-3940256099942544~1458002511",
    banner: "ca-app-pub-3940256099942544/2435281174",
    interstitial: "ca-app-pub-3940256099942544/4411468910",
    rewarded: "ca-app-pub-3940256099942544/1712485313",
    appOpen: "ca-app-pub-3940256099942544/5575463023",
    native: "ca-app-pub-3940256099942544/3986624511",
  },
} as const;

function envStr(key: string): string {
  if (typeof import.meta === "undefined") return "";
  return String((import.meta.env as Record<string, unknown>)?.[key] || "");
}

export const ADMOB_IDS = {
  android: {
    appId: IS_DEV ? ADMOB_TEST_IDS.android.appId : envStr("VITE_ADMOB_ANDROID_APP_ID"),
    banner: IS_DEV ? ADMOB_TEST_IDS.android.banner : envStr("VITE_ADMOB_ANDROID_BANNER"),
    interstitial: IS_DEV
      ? ADMOB_TEST_IDS.android.interstitial
      : envStr("VITE_ADMOB_ANDROID_INTERSTITIAL"),
    rewarded: IS_DEV
      ? ADMOB_TEST_IDS.android.rewarded
      : envStr("VITE_ADMOB_ANDROID_REWARDED"),
    appOpen: IS_DEV
      ? ADMOB_TEST_IDS.android.appOpen
      : envStr("VITE_ADMOB_ANDROID_APP_OPEN"),
    native: IS_DEV ? ADMOB_TEST_IDS.android.native : envStr("VITE_ADMOB_ANDROID_NATIVE"),
  },
  ios: {
    appId: IS_DEV ? ADMOB_TEST_IDS.ios.appId : envStr("VITE_ADMOB_IOS_APP_ID"),
    banner: IS_DEV ? ADMOB_TEST_IDS.ios.banner : envStr("VITE_ADMOB_IOS_BANNER"),
    interstitial: IS_DEV
      ? ADMOB_TEST_IDS.ios.interstitial
      : envStr("VITE_ADMOB_IOS_INTERSTITIAL"),
    rewarded: IS_DEV ? ADMOB_TEST_IDS.ios.rewarded : envStr("VITE_ADMOB_IOS_REWARDED"),
    appOpen: IS_DEV ? ADMOB_TEST_IDS.ios.appOpen : envStr("VITE_ADMOB_IOS_APP_OPEN"),
    native: IS_DEV ? ADMOB_TEST_IDS.ios.native : envStr("VITE_ADMOB_IOS_NATIVE"),
  },
} as const;

export const ADSENSE_CONFIG = {
  publisherId: envStr("VITE_ADSENSE_PUBLISHER_ID"),
  slots: {
    home: envStr("VITE_ADSENSE_SLOT_HOME"),
    article: envStr("VITE_ADSENSE_SLOT_ARTICLE"),
    faq: envStr("VITE_ADSENSE_SLOT_FAQ"),
    historyDaily: envStr("VITE_ADSENSE_SLOT_HISTORY_DAILY"),
  },
} as const;

export const AD_FREQUENCY_CAPS = {
  interstitialCooldownMs: 4 * 60 * 1000, // max 1 per 4 minutes
  interstitialMaxPerSession: 3,
  appOpenMinBackgroundMs: 4 * 60 * 60 * 1000, // resume after >= 4 hours
  rewardedAdFreeMs: 24 * 60 * 60 * 1000, // 24 hours ad-free
  resultInlineDelayMs: 3000, // 3s after reveal animation ends
} as const;

export const FORBIDDEN_AD_SEGMENTS = ["prepare", "focus", "dua"] as const;

export function isAdAllowedOnPath(pathname: string): boolean {
  return !FORBIDDEN_AD_SEGMENTS.some((seg) =>
    pathname.split("/").includes(seg)
  );
}
