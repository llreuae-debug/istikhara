import { useState } from "react";
import { Download } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { downloadFullQuranOffline } from "@/lib/quranApi";
import type {
  LanguageMode,
  ReciterEdition,
  SelectionMode,
  ThemeMode,
} from "@/lib/storage";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";

export default function Settings() {
  const { settings, updateSettings, t } = useApp();
  const [downloadPct, setDownloadPct] = useState<number | null>(null);

  const handleOfflineDownload = async () => {
    setDownloadPct(5);
    try {
      await downloadFullQuranOffline((pct) => setDownloadPct(pct));
      updateSettings({ offlineDownloaded: true });
    } catch {
      setDownloadPct(null);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
          {t.settings.title}
        </h1>

        <div className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] backdrop-blur-md p-5 sm:p-7 space-y-6">
          {/* Language */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {t.settings.language}
            </label>
            <div className="flex flex-wrap gap-2">
              {(["ur", "en", "both"] as LanguageMode[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => updateSettings({ language: lang })}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                    settings.language === lang
                      ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                      : "border-[var(--border-subtle)] text-[var(--text-primary)]"
                  }`}
                >
                  {lang === "ur" ? "اردو" : lang === "en" ? "English" : "اردو + English"}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {t.settings.theme}
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "dark", label: t.settings.themeDark },
                  { id: "light", label: t.settings.themeLight },
                  { id: "auto", label: t.settings.themeAuto },
                ] as Array<{ id: ThemeMode; label: string }>
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateSettings({ theme: item.id })}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                    settings.theme === item.id
                      ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                      : "border-[var(--border-subtle)] text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Arabic Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="arabic-size" className="font-medium text-[var(--text-primary)]">
                {t.settings.arabicSize}
              </label>
              <span className="text-[var(--accent-gold)]">{settings.arabicFontSize}px</span>
            </div>
            <input
              id="arabic-size"
              type="range"
              min={22}
              max={44}
              value={settings.arabicFontSize}
              onChange={(e) =>
                updateSettings({ arabicFontSize: Number(e.target.value) })
              }
              className="w-full accent-[#C9A227]"
            />
          </div>

          {/* Reciter */}
          <div className="space-y-2">
            <label htmlFor="reciter-select" className="block text-sm font-medium text-[var(--text-primary)]">
              {t.settings.reciter}
            </label>
            <select
              id="reciter-select"
              value={settings.reciter}
              onChange={(e) =>
                updateSettings({ reciter: e.target.value as ReciterEdition })
              }
              className="w-full rounded-xl border border-[var(--border-gold)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
            >
              <option value="ar.alafasy">Mishary Rashid Alafasy (ar.alafasy)</option>
              <option value="ar.abdulbasitmurattal">Abdul Basit Murattal (ar.abdulbasitmurattal)</option>
              <option value="ar.husary">Mahmoud Khalil Al-Husary (ar.husary)</option>
            </select>
          </div>

          {/* Selection Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {t.settings.selectionMode}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  { id: "full", label: t.settings.modeFull },
                  { id: "reflection", label: t.settings.modeReflection },
                ] as Array<{ id: SelectionMode; label: string }>
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateSettings({ selectionMode: m.id })}
                  className={`px-4 py-2.5 rounded-xl text-sm border text-start transition-colors ${
                    settings.selectionMode === m.id
                      ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                      : "border-[var(--border-subtle)] text-[var(--text-primary)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: Haptics & Animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] px-4 py-3 cursor-pointer">
              <span className="text-sm text-[var(--text-primary)]">{t.settings.haptics}</span>
              <input
                type="checkbox"
                checked={settings.haptics}
                onChange={(e) => updateSettings({ haptics: e.target.checked })}
                className="w-4 h-4 accent-[#C9A227]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] px-4 py-3 cursor-pointer">
              <span className="text-sm text-[var(--text-primary)]">{t.settings.animations}</span>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) => updateSettings({ animations: e.target.checked })}
                className="w-4 h-4 accent-[#C9A227]"
              />
            </label>
          </div>

          {/* Offline Quran Download */}
          <div className="border-t border-[var(--border-subtle)] pt-5 space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {t.settings.offlineTitle}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {t.settings.offlineDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOfflineDownload}
              disabled={downloadPct !== null && downloadPct < 100}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              {settings.offlineDownloaded
                ? t.settings.offlineDone
                : downloadPct !== null
                ? `${downloadPct}%`
                : t.settings.offlineBtn}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
