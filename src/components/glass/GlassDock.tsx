import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Compass, Film, Home, Sun } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { LiquidGlassTabs, type LiquidTabItem } from "./LiquidGlassTabs";

export function useMainNavTabs(): {
  items: LiquidTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
} {
  const { uiLang, isRtl } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isUrdu = uiLang === "ur";

  const items: LiquidTabItem[] = [
    { id: "home", label: isUrdu ? "ہوم" : "Home", icon: <Home className="w-3.5 h-3.5 hidden sm:inline-block" aria-hidden="true" /> },
    { id: "istikhara", label: isUrdu ? "استخارہ" : "Istikhara", icon: <Compass className="w-3.5 h-3.5 hidden sm:inline-block" aria-hidden="true" /> },
    { id: "studio", label: isUrdu ? "ویڈیو" : "Videos", icon: <Film className="w-3.5 h-3.5 hidden sm:inline-block" aria-hidden="true" /> },
    { id: "daily", label: isUrdu ? "آج کی آیت" : "Daily", icon: <Sun className="w-3.5 h-3.5 hidden sm:inline-block" aria-hidden="true" /> },
    { id: "guide", label: isUrdu ? "رہنمائی" : "Guide", icon: <BookOpen className="w-3.5 h-3.5 hidden sm:inline-block" aria-hidden="true" /> },
  ];

  const p = location.pathname;
  let activeId = "home";
  if (p.includes("/prepare") || p.includes("/focus") || p.includes("/result")) activeId = "istikhara";
  else if (p.includes("/studio")) activeId = "studio";
  else if (p.includes("/daily")) activeId = "daily";
  else if (p.includes("/guide") || p.includes("/faq") || p.includes("/dua")) activeId = "guide";

  const onSelect = (id: string) => {
    const map: Record<string, string> = {
      home: `/${uiLang}/`,
      istikhara: `/${uiLang}/prepare`,
      studio: `/${uiLang}/studio`,
      daily: `/${uiLang}/daily`,
      guide: `/${uiLang}/guide`,
    };
    const dest = map[id];
    if (dest && dest !== p) navigate(dest);
  };

  // Suppress unused variable warning while keeping isRtl parity
  void isRtl;

  return { items, activeId, onSelect };
}

export function GlassDock() {
  const { isRtl } = useApp();
  const { items, activeId, onSelect } = useMainNavTabs();

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 max-w-[96vw]"
    >
      <LiquidGlassTabs
        items={items}
        value={activeId}
        onChange={onSelect}
        isRtl={isRtl}
        compact
        ariaLabel="Mobile bottom navigation"
      />
    </nav>
  );
}
