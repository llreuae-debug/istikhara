import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Info, Settings, Download, X } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AppHeader() {
  const { t } = useApp();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link to="/" aria-label={t.nav.home} className="inline-flex items-center">
          <Logo size={36} variant={isHome ? "mark" : "horizontal"} />
        </Link>

        <nav className="flex items-center gap-2" aria-label="Primary">
          <LanguageToggle />
          <Link
            to="/settings"
            aria-label={t.nav.settings}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--border-gold)] transition-colors"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/about"
            aria-label={t.nav.about}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--border-gold)] transition-colors"
          >
            <Info className="w-4 h-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PwaInstallBanner() {
  const { settings, t } = useApp();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed || settings.completedCount < 1) {
    return null;
  }

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
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
