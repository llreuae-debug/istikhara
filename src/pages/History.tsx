import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Download, Trash2 } from "lucide-react";
import { useApp } from "@/lib/i18n";
import {
  clearHistory,
  loadHistory,
  updateHistoryEntry,
  type HistoryEntry,
  type IntentionCategory,
} from "@/lib/storage";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";

const ALL_CATEGORIES: Array<IntentionCategory | "all"> = [
  "all",
  "marriage",
  "business",
  "job",
  "travel",
  "study",
  "property",
  "other",
];

export default function History() {
  const { t, uiLang } = useApp();
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [categoryFilter, setCategoryFilter] = useState<IntentionCategory | "all">("all");
  const [draftJournals, setDraftJournals] = useState<Record<string, string>>({});

  const filtered = entries.filter((item) => {
    if (tab === "saved" && !item.saved) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });

  const handleToggleSave = (item: HistoryEntry) => {
    setEntries(updateHistoryEntry(item.id, { saved: !item.saved }));
  };

  const handleSaveJournal = (id: string) => {
    const val = draftJournals[id] ?? "";
    setEntries(updateHistoryEntry(id, { journalNote: val }));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `istikhara-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm(t.history.confirmClear)) {
      clearHistory();
      setEntries([]);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
            {t.history.title}
          </h1>
          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-gold)] text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                {t.history.exportJson}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-400/40 text-xs text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                {t.history.clearAll}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              tab === "all"
                ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
            }`}
          >
            {t.history.allTab}
          </button>
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              tab === "saved"
                ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
            }`}
          >
            {t.history.savedTab}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                categoryFilter === cat
                  ? "border-[var(--gold)] bg-[var(--gold)]/20 text-[var(--accent-gold)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)]"
              }`}
            >
              {cat === "all" ? t.history.allTab : t.categories[cat]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 text-center space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">{t.history.empty}</p>
            <Link
              to="/prepare"
              className="inline-block px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] text-sm font-semibold"
            >
              {t.home.beginCta}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const journalValue =
                draftJournals[item.id] ?? item.journalNote ?? "";
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--accent-gold)]">
                      <Link
                        to={`/ayah/${item.surah}/${item.ayah}`}
                        className="font-semibold underline underline-offset-4"
                      >
                        {item.surahNameEn} ({item.surah}:{item.ayah})
                      </Link>
                      <span>•</span>
                      <span>{t.categories[item.category]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSave(item)}
                        aria-label={item.saved ? t.result.saved : t.result.save}
                        className={`p-1.5 rounded-lg border ${
                          item.saved
                            ? "border-[var(--gold)] text-[var(--accent-gold)]"
                            : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                        }`}
                      >
                        <Bookmark className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p
                    className={`text-sm text-[var(--text-primary)]/90 ${
                      uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
                    }`}
                  >
                    {uiLang === "ur" ? item.firstLineUr : item.firstLineEn}…
                  </p>

                  {item.note && (
                    <p className="text-xs text-[var(--text-muted)] italic">
                      “{item.note}”
                    </p>
                  )}

                  {/* Reflection journal */}
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <label className="block text-xs text-[var(--text-secondary)]">
                      {t.history.journalLabel}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={journalValue}
                        onChange={(e) =>
                          setDraftJournals((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder={t.history.journalPlaceholder}
                        className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveJournal(item.id)}
                        className="px-4 py-2 rounded-xl border border-[var(--border-gold)] text-xs font-medium text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)]"
                      >
                        {t.history.saveJournal}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
