import { SITE_CONFIG } from "@/config/site";

export type AnalyticsEvent =
  | { name: "istikhara_started" }
  | { name: "verse_revealed"; props: { mode: string } }
  | { name: "pdf_downloaded" }
  | { name: "image_shared"; props: { preset: string } }
  | { name: "video_exported"; props: { preset: string; lang: string; duration: number } }
  | { name: "video_shared"; props: { platform: string } }
  | { name: "language_switched"; props: { to: string } }
  | { name: "pwa_installed" };

let injected = false;

export function initAnalytics(): void {
  if (typeof window === "undefined" || injected || !SITE_CONFIG.analytics.src) {
    return;
  }
  injected = true;
  const s = document.createElement("script");
  s.defer = true;
  s.src = SITE_CONFIG.analytics.src;
  if (SITE_CONFIG.analytics.domain) {
    s.setAttribute("data-domain", SITE_CONFIG.analytics.domain);
  }
  document.head.appendChild(s);
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || !SITE_CONFIG.analytics.src) return;
  const w = window as unknown as {
    plausible?: (n: string, opts?: { props?: Record<string, unknown> }) => void;
    umami?: { track: (n: string, props?: Record<string, unknown>) => void };
  };
  const props = "props" in event ? event.props : undefined;
  if (typeof w.plausible === "function") {
    w.plausible(event.name, props ? { props } : undefined);
  } else if (w.umami && typeof w.umami.track === "function") {
    w.umami.track(event.name, props);
  }
}
