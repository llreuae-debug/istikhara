import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/i18n";
import { REFLECTION_SET } from "@/content/reflectionSet";
import { getAyah, type FetchedAyah } from "@/lib/quran";
import { pickRandomItem, secureRandomInt } from "@/lib/random";
import { trackEvent } from "@/lib/analytics";
import {
  addHistoryEntry,
  loadIntention,
  updateHistoryEntry,
} from "@/lib/storage";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppFooter, AppHeader } from "@/components/AppShell";
import { VerseCard } from "@/components/VerseCard";
import { AdSlot } from "@/components/AdSlot";
import { AD_FREQUENCY_CAPS } from "@/config/ads";
import { Head } from "@/seo/Head";

export default function Result() {
  const { settings, updateSettings, t, uiLang } = useApp();
  const navigate = useNavigate();

  const [ayah, setAyah] = useState<FetchedAyah | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const intention = loadIntention();

  const loadVerse = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const ref: string | number =
        settings.selectionMode === "reflection"
          ? pickRandomItem(REFLECTION_SET)
          : secureRandomInt(1, 6236);

      const fetched = await getAyah(ref);
      setAyah(fetched);
      trackEvent({
        name: "verse_revealed",
        props: { mode: settings.selectionMode },
      });

      const id = `${Date.now()}-${fetched.globalNumber}`;
      setEntryId(id);
      setIsSaved(false);

      addHistoryEntry({
        id,
        timestamp: new Date().toISOString(),
        surah: fetched.surahNumber,
        ayah: fetched.ayahNumber,
        globalNumber: fetched.globalNumber,
        surahNameAr: fetched.surahNameAr,
        surahNameEn: fetched.surahNameEn,
        category: intention.category,
        note: intention.note || undefined,
        saved: false,
        firstLineUr: fetched.urduText.slice(0, 120),
        firstLineEn: fetched.englishText.slice(0, 120),
      });

      updateSettings({ completedCount: settings.completedCount + 1 });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [settings.selectionMode]);

  useEffect(() => {
    loadVerse();
  }, []);

  const handleToggleSave = () => {
    if (!entryId) return;
    const next = !isSaved;
    setIsSaved(next);
    updateHistoryEntry(entryId, { saved: next });
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <Head pageKey="result" lang={uiLang} />
      <GeometricBackground brighten />
      <AppHeader />

      <main className="flex-1 px-4 py-8 sm:py-12">
        {loading && (
          <div className="max-w-3xl mx-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-8 space-y-6">
            <div className="h-5 w-40 mx-auto rounded-full mushaf-shimmer" />
            <div className="h-16 w-full rounded-xl mushaf-shimmer" />
            <div className="h-10 w-5/6 mx-auto rounded-xl mushaf-shimmer" />
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
              onClick={loadVerse}
              className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
            >
              {t.result.retry}
            </button>
          </div>
        )}

        {ayah && !loading && (
          <div className="space-y-8">
            <VerseCard
              ayah={ayah}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              onNewIstikhara={() => navigate(`/${uiLang}/prepare`)}
              categoryLabel={t.categories[intention.category]}
              privateNote={intention.note}
            />
            <AdSlot
              format="inline"
              delayMs={AD_FREQUENCY_CAPS.resultInlineDelayMs}
            />
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
