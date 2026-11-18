import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ADSENSE_CONFIG, isAdAllowedOnPath } from "@/config/ads";
import { adService } from "@/lib/ads/adService";
import { isNative } from "@/lib/platform";
import { useApp } from "@/lib/i18n";

interface AdSlotProps {
  format: "banner" | "inline" | "native";
  slotKey?: keyof typeof ADSENSE_CONFIG.slots;
  delayMs?: number;
}

export function AdSlot({ format, slotKey = "article", delayMs = 0 }: AdSlotProps) {
  const { pathname } = useLocation();
  const { uiLang } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(delayMs === 0);
  const [nearViewport, setNearViewport] = useState(false);

  const allowed = isAdAllowedOnPath(pathname) && !adService.isAdFree();

  useEffect(() => {
    if (delayMs <= 0) return;
    const t = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (!allowed || !ready || isNative()) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNearViewport(true);
          adService.loadWebAdSense();
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [allowed, ready]);

  if (!allowed || !ready) return null;

  // Web AdSense slot (only renders when publisherId & slotId are configured)
  const slotId = ADSENSE_CONFIG.slots[slotKey];
  if (!isNative() && (!ADSENSE_CONFIG.publisherId || !slotId)) {
    return null;
  }

  const minH = format === "inline" ? "min-h-[250px]" : "min-h-[100px]";

  return (
    <aside
      ref={containerRef}
      aria-label={uiLang === "ur" ? "اشتہار" : "Advertisement"}
      data-ad-slot={format}
      className={`w-full max-w-3xl mx-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 p-3 text-center ${minH}`}
    >
      <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
        اشتہار / Advertisement
      </p>
      {!isNative() && nearViewport && (
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </aside>
  );
}
