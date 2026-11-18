// TODO: fill in real Play Store & App Store URLs/IDs once published. Empty = "Coming soon".
export const STORE_CONFIG: {
  androidPackage: string;
  iosAppId: string;
  playStoreUrl: string;
  appStoreUrl: string;
} = {
  androidPackage: "com.istikhara.app",
  iosAppId: (import.meta.env.VITE_IOS_APP_ID as string | undefined) ?? "", // e.g. "6738912345"
  playStoreUrl: (import.meta.env.VITE_PLAY_STORE_URL as string | undefined) ?? "", // e.g. "https://play.google.com/store/apps/details?id=com.istikhara.app"
  appStoreUrl: (import.meta.env.VITE_APP_STORE_URL as string | undefined) ?? "", // e.g. "https://apps.apple.com/app/id6738912345"
};

export function getPlayStoreUrl(placement: string): string | null {
  if (!STORE_CONFIG.playStoreUrl) return null;
  const sep = STORE_CONFIG.playStoreUrl.includes("?") ? "&" : "?";
  const ref = encodeURIComponent(`utm_source=website&utm_medium=${placement}`);
  return `${STORE_CONFIG.playStoreUrl}${sep}referrer=${ref}`;
}

export function getAppStoreUrl(placement: string): string | null {
  if (!STORE_CONFIG.appStoreUrl) return null;
  const sep = STORE_CONFIG.appStoreUrl.includes("?") ? "&" : "?";
  return `${STORE_CONFIG.appStoreUrl}${sep}ct=${encodeURIComponent(placement)}`;
}
