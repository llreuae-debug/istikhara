import { Link } from "react-router-dom";
import { BookOpen, History, Sparkles, Sun } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { getFormattedDates } from "@/lib/hijri";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Logo } from "@/components/Logo";

export default function Home() {
  const { t, uiLang } = useApp();
  const dates = getFormattedDates();

  return (
    <div className="min-h-dvh flex flex-col">
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14 text-center">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <Logo animated variant="stacked" size={88} />

          {/* Bilingual taglines */}
          <div className="space-y-2">
            <p className="font-urdu-nastaliq text-xl sm:text-2xl text-[var(--text-primary)]" dir="rtl">
              قرآنی آیات کے ذریعے الہٰی رہنمائی
            </p>
            <p className="font-display-serif text-lg sm:text-xl text-[var(--accent-gold)] tracking-wide" dir="ltr">
              Receive divine guidance through Quranic verse
            </p>
          </div>

          {/* Hijri + Gregorian Date */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-[var(--border-gold)] bg-[var(--bg-card)] text-xs sm:text-sm text-[var(--text-secondary)]">
            <span>{uiLang === "ur" ? dates.hijriUr : dates.hijriEn}</span>
            <span aria-hidden="true" className="text-[var(--accent-gold)]">•</span>
            <span>{uiLang === "ur" ? dates.gregorianUr : dates.gregorianEn}</span>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <Link
              to="/prepare"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-base sm:text-lg shadow-[0_12px_36px_rgba(201,162,39,0.28)] hover:bg-[var(--gold-soft)] transition-all"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>استخارہ شروع کریں / Begin Istikhara</span>
            </Link>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            {t.home.subtitle}
          </p>

          {/* Secondary navigation cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              to="/guide"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[var(--border-gold)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <span>مسنون طریقہ / Sunnah Method</span>
            </Link>

            <Link
              to="/daily"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[var(--border-gold)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Sun className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <span>آج کی آیت / Verse of the Day</span>
            </Link>

            <Link
              to="/history"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[var(--border-gold)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <History className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <span>میری آیات / My Verses</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
