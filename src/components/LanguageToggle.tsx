import { useApp } from "@/lib/i18n";

export function LanguageToggle() {
  const { uiLang, toggleLanguage } = useApp();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
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
