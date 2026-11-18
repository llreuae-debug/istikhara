import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Info, Settings, Smartphone } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { isNative } from "@/lib/platform";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LiquidGlassTabs } from "./LiquidGlassTabs";
import { useMainNavTabs } from "./GlassDock";

interface GlassHeaderProps {
  onOpenAppModal?: () => void;
}

export function GlassHeader({ onOpenAppModal }: GlassHeaderProps) {
  const { t, uiLang, isRtl } = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { items, activeId, onSelect } = useMainNavTabs();

  const isHome =
    location.pathname === "/" ||
    location.pathname === `/${uiLang}` ||
    location.pathname === `/${uiLang}/`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)] transition-all duration-200 ${
        scrolled
          ? "glass-2 border-b border-[var(--border-subtle)]"
          : "glass-1 border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <Link to={`/${uiLang}/`} aria-label={t.nav.home} className="inline-flex items-center shrink-0">
          <Logo size={34} variant={isHome ? "mark" : "horizontal"} />
        </Link>

        {/* Desktop centered LiquidGlassTabs */}
        <div className="hidden md:flex justify-center flex-1">
          <LiquidGlassTabs
            items={items}
            value={activeId}
            onChange={onSelect}
            isRtl={isRtl}
            compact
            ariaLabel="Primary navigation"
          />
        </div>

        <nav className="flex items-center gap-2 shrink-0" aria-label="Utilities">
          {!isNative() && onOpenAppModal && (
            <button
              type="button"
              onClick={onOpenAppModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-1 glass-border-mask text-xs font-medium text-[var(--accent-gold)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{uiLang === "ur" ? "ایپ حاصل کریں" : "Get the App"}</span>
            </button>
          )}
          <LanguageToggle />
          <Link
            to={`/${uiLang}/settings`}
            aria-label={t.nav.settings}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full glass-1 glass-border-mask text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to={`/${uiLang}/about`}
            aria-label={t.nav.about}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full glass-1 glass-border-mask text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
          >
            <Info className="w-4 h-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
