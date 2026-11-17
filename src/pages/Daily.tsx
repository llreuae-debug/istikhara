import { useEffect, useState } from "react";
import { useApp } from "@/lib/i18n";
import { REFLECTION_SET } from "@/content/reflectionSet";
import { getAyah, type FetchedAyah } from "@/lib/quran";
import { deterministicDateIndex, getTodayDateKey } from "@/lib/random";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppFooter, AppHeader } from "@/components/AppShell";
import { VerseCard } from "@/components/VerseCard";
import { Head } from "@/seo/Head";

export default function Daily() {
  const { t, uiLang } = useApp();
  const [ayah, setAyah] = useState<FetchedAyah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const dateKey = getTodayDateKey();
  const ref =
    REFLECTION_SET[deterministicDateIndex(dateKey, REFLECTION_SET.length)];

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const fetched = await getAyah(ref);
      setAyah(fetched);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [ref]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Head pageKey="daily" lang={uiLang} />
      <GeometricBackground brighten />
      <AppHeader />

      <main className="flex-1 px-4 py-8 sm:py-12 space-y-6">
        <header className="text-center space-y-1">
          <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
            {t.daily.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {t.daily.subtitle} • {dateKey}
          </p>
        </header>

        {loading && (
          <div className="max-w-3xl mx-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-8 space-y-6">
            <div className="h-5 w-40 mx-auto rounded-full mushaf-shimmer" />
            <div className="h-16 w-full rounded-xl mushaf-shimmer" />
            <p className="text-center text-sm text-[var(--text-muted)]">
              {t.result.loading}
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-md mx-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-8 text-center space-y-4">
            <h2 className="font-display-serif text-xl font-semibold text-[var(--accent-gold)]">
              {t.result.errorTitle}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{t.result.errorBody}</p>
            <button
              type="button"
              onClick={load}
              className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
            >
              {t.result.retry}
            </button>
          </div>
        )}

        {ayah && !loading && <VerseCard ayah={ayah} />}
      </main>
    </div>
  );
}
