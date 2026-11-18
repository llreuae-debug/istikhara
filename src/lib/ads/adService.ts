import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from "@capacitor-community/admob";
import {
  AD_FREQUENCY_CAPS,
  ADMOB_IDS,
  ADSENSE_CONFIG,
  isAdAllowedOnPath,
} from "@/config/ads";
import { isAndroid, isIOS, isNative } from "@/lib/platform";

const AD_FREE_UNTIL_KEY = "istikhara:adFreeUntil";
const FIRST_SESSION_KEY = "istikhara:hasCompletedSession";
const WEB_CONSENT_KEY = "istikhara:webConsent";

class AdService {
  private initialized = false;
  private bannerVisible = false;
  private recitationPlaying = false;
  private sessionInterstitials = 0;
  private lastInterstitialAt = 0;
  private lastBackgroundAt = 0;
  private adsenseLoaded = false;

  getAdFreeUntil(): number {
    if (typeof localStorage === "undefined") return 0;
    return Number(localStorage.getItem(AD_FREE_UNTIL_KEY) || 0);
  }

  isAdFree(): boolean {
    return Date.now() < this.getAdFreeUntil();
  }

  grant24hAdFree(): number {
    const until = Date.now() + AD_FREQUENCY_CAPS.rewardedAdFreeMs;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AD_FREE_UNTIL_KEY, String(until));
    }
    this.hideBanner().catch(() => {});
    return until;
  }

  setRecitationPlaying(playing: boolean): void {
    this.recitationPlaying = playing;
    if (playing && this.bannerVisible) {
      this.hideBanner().catch(() => {});
    }
  }

  private getPlatformIds() {
    return isIOS() ? ADMOB_IDS.ios : ADMOB_IDS.android;
  }

  async initNativeAds(): Promise<void> {
    if (!isNative() || this.initialized) return;
    try {
      const consent = await AdMob.requestConsentInfo();
      if (
        consent.isConsentFormAvailable &&
        consent.status === AdmobConsentStatus.REQUIRED
      ) {
        await AdMob.showConsentForm();
      }

      if (isIOS()) {
        const att = await AdMob.trackingAuthorizationStatus();
        if (att.status === "notDetermined") {
          await AdMob.requestTrackingAuthorization();
        }
      }

      await AdMob.initialize({
        initializeForTesting: Boolean(import.meta.env?.DEV),
        maxAdContentRating: MaxAdContentRating.General,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      await AdMob.setApplicationMuted({ muted: true }).catch(() => {});
      this.initialized = true;
      await this.preloadInterstitial();
    } catch {
      // Never block app startup if AdMob fails
    }
  }

  async showPrivacyOptions(): Promise<void> {
    if (!isNative()) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(WEB_CONSENT_KEY);
      }
      return;
    }
    try {
      await AdMob.showPrivacyOptionsForm();
    } catch {
      // ignore if not required in region
    }
  }

  async showBanner(pathname: string): Promise<void> {
    if (
      !isNative() ||
      !this.initialized ||
      this.isAdFree() ||
      this.recitationPlaying ||
      !isAdAllowedOnPath(pathname)
    ) {
      return;
    }
    const adId = this.getPlatformIds().banner;
    if (!adId) return;

    try {
      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: Boolean(import.meta.env?.DEV),
      });
      this.bannerVisible = true;
    } catch {
      this.bannerVisible = false;
    }
  }

  async hideBanner(): Promise<void> {
    if (!isNative() || !this.bannerVisible) return;
    try {
      await AdMob.hideBanner();
    } catch {
      // ignore
    } finally {
      this.bannerVisible = false;
    }
  }

  async preloadInterstitial(): Promise<void> {
    if (!isNative() || !this.initialized || this.isAdFree()) return;
    const adId = this.getPlatformIds().interstitial;
    if (!adId) return;
    await AdMob.prepareInterstitial({
      adId,
      isTesting: Boolean(import.meta.env?.DEV),
    }).catch(() => {});
  }

  async showInterstitialAfterExport(): Promise<void> {
    if (!isNative() || !this.initialized || this.isAdFree() || this.recitationPlaying) {
      return;
    }
    if (typeof localStorage !== "undefined" && !localStorage.getItem(FIRST_SESSION_KEY)) {
      localStorage.setItem(FIRST_SESSION_KEY, "1");
      return; // Never in first session
    }
    if (this.sessionInterstitials >= AD_FREQUENCY_CAPS.interstitialMaxPerSession) {
      return;
    }
    if (Date.now() - this.lastInterstitialAt < AD_FREQUENCY_CAPS.interstitialCooldownMs) {
      return;
    }

    try {
      await AdMob.showInterstitial();
      this.sessionInterstitials++;
      this.lastInterstitialAt = Date.now();
      this.preloadInterstitial();
    } catch {
      // ignore
    }
  }

  async showRewardedFor24hAdFree(): Promise<boolean> {
    if (!isNative() || !this.initialized) return false;
    const adId = this.getPlatformIds().rewarded;
    if (!adId) return false;

    try {
      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: Boolean(import.meta.env?.DEV),
      });
      const reward = await AdMob.showRewardVideoAd();
      if (reward) {
        this.grant24hAdFree();
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  markBackgrounded(): void {
    this.lastBackgroundAt = Date.now();
  }

  async maybeShowAppOpenOnResume(openedFromDeepLinkOrNotif: boolean): Promise<void> {
    if (
      !isNative() ||
      !this.initialized ||
      this.isAdFree() ||
      openedFromDeepLinkOrNotif ||
      !this.lastBackgroundAt
    ) {
      return;
    }
    const bgElapsed = Date.now() - this.lastBackgroundAt;
    if (bgElapsed < AD_FREQUENCY_CAPS.appOpenMinBackgroundMs) return;
    if (Date.now() - this.lastInterstitialAt < AD_FREQUENCY_CAPS.interstitialCooldownMs) {
      return;
    }

    const adId = this.getPlatformIds().appOpen;
    if (!adId) return;
    try {
      await AdMob.loadAppOpen({ adId });
      await AdMob.showAppOpen({ adId });
    } catch {
      // ignore
    }
  }

  /* Web AdSense (never loaded in native apps) */
  loadWebAdSense(): void {
    if (
      isNative() ||
      this.adsenseLoaded ||
      !ADSENSE_CONFIG.publisherId ||
      typeof document === "undefined"
    ) {
      return;
    }
    this.adsenseLoaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
    document.head.appendChild(s);
  }
}

export const adService = new AdService();
export { isAndroid };
