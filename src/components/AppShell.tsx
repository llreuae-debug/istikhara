import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, Info, Settings, Smartphone, X } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { isNative } from "@/lib/platform";
import { adService } from "@/lib/ads/adService";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { AndroidSmartBanner, GetAppModal, StoreBadges } from "./StoreBadges";
import { GlassHeader } from "./glass/GlassHeader";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AppHeader() {
  const { t, uiLang } = useApp();
  const location = useLocation();
  const [appModalOpen, setAppModalOpen] = useState(false);

  const isHome =
    location.pathname === "/" ||
    location.pathname === `/${uiLang}` ||
    location.pathname === `/${uiLang}/`;

  useEffect(() => {
    if (!isNative()) return;
    adService.showBanner(location.pathname);
    return () => {
      adService.hideBanner();
    };
  }, [location.pathname]);

  return (
    <>
      <AndroidSmartBanner />
      <GlassHeader onOpenAppModal={() => setAppModalOpen(true)} />
      <GetAppModal open={appModalOpen} onClose={() => setAppModalOpen(false)} />
    </>
  );
}

export function AppFooter() {
  const { uiLang, t } = useApp();
  const isUrdu = uiLang === "ur";

  return (
    <footer className="border-t border-[var(--border-subtle)] glass-1 mt-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-6">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {!isNative() && (
          <div className="flex flex-col items-center gap-2">
            <StoreBadges placement="footer" />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p className={isUrdu ? "font-urdu-nastaliq text-center sm:text-start" : "text-center sm:text-start"}>
            {isUrdu
              ? "استخارہ — Al-Quran Cloud (quran-uthmani, ur.jalandhry, en.sahih) • کوئی لاگ ان نہیں، تمام ڈیٹا صرف آپ کے آلے پر۔"
              : "Istikhara — Sources: Al-Quran Cloud & Sahih al-Bukhari 1162 • Zero accounts; all notes stay on your device."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to={`/${uiLang}/guide`} className="hover:text-[var(--accent-gold)]">
              {t.nav.guide}
            </Link>
            <Link to={`/${uiLang}/faq`} className="hover:text-[var(--accent-gold)]">
              FAQ
            </Link>
            <Link to={`/${uiLang}/privacy`} className="hover:text-[var(--accent-gold)]">
              {isUrdu ? "رازداری" : "Privacy"}
            </Link>
            <Link to={`/${uiLang}/contact`} className="hover:text-[var(--accent-gold)]">
              {isUrdu ? "رابطہ" : "Contact"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PwaInstallBanner() {
  const { settings, t } = useApp();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isNative()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isNative() || !deferredPrompt || dismissed || settings.completedCount < 1) {
    return null;
  }

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const res = await deferredPrompt.userChoice;
    if (res.outcome === "accepted") {
      trackEvent({ name: "pwa_installed" });
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 max-w-md mx-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-primary)]/95 backdrop-blur-md p-4 shadow-2xl flex items-center justify-between gap-3">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {t.pwa.installTitle}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">{t.pwa.installBody}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--gold)] text-[#0A1A2F] text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          {t.pwa.installBtn}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t.pwa.dismiss}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
