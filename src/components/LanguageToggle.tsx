import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

export function LanguageToggle() {
  const { uiLang, updateSettings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = () => {
    const nextLang = uiLang === "ur" ? "en" : "ur";
    updateSettings({ language: nextLang });
    trackEvent({ name: "language_switched", props: { to: nextLang } });

    const stripped = location.pathname.replace(/^\/(ur|en)(?=\/|$)/, "");
    const nextPath = `/${nextLang}${stripped || "/"}`;
    navigate(`${nextPath}${location.search}`, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={uiLang === "ur" ? "Switch to English" : "اردو میں تبدیل کریں"}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-gold)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--gold)] transition-colors"
    >
      <span className={uiLang === "ur" ? "text-[var(--accent-gold)] font-semibold" : "opacity-65"}>
        اردو
      </span>
      <span className="opacity-40">/</span>
      <span className={uiLang === "en" ? "text-[var(--accent-gold)] font-semibold" : "opacity-65"}>
        EN
      </span>
    </button>
  );
}
