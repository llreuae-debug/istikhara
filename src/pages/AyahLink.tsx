import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "@/lib/i18n";
import { fetchAyahByRef, type FetchedAyah } from "@/lib/quranApi";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { VerseCard } from "@/components/VerseCard";

export default function AyahLink() {
  const { surah, ayah: ayahParam } = useParams<{ surah: string; ayah: string }>();
  const { t } = useApp();

  const [ayah, setAyah] = useState<FetchedAyah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const fetched = await fetchAyahByRef(`${surah}:${ayahParam}`);
      setAyah(fetched);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [surah, ayahParam]);

  return (
    <div className="min-h-dvh flex flex-col">
      <GeometricBackground brighten />
      <AppHeader />

      <main className="flex-1 px-4 py-8 sm:py-12">
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
            <h1 className="font-display-serif text-2xl font-semibold text-[var(--accent-gold)]">
              {t.result.errorTitle}
            </h1>
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

        {ayah && !loading && (
          <VerseCard
            ayah={ayah}
            ctaSlot={
              <Link
                to="/prepare"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)] transition-colors"
              >
                {t.result.performOwn}
              </Link>
            }
          />
        )}
      </main>
    </div>
  );
}
