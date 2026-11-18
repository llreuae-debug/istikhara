import { useState } from "react";
import { Download } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { downloadFullQuranOffline } from "@/lib/quranApi";
import { adService } from "@/lib/ads/adService";
import { scheduleDailyVerseNotification } from "@/lib/notifications";
import { isNative } from "@/lib/platform";
import type {
  LanguageMode,
  ReciterEdition,
  SelectionMode,
  ThemeMode,
} from "@/lib/storage";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppFooter, AppHeader } from "@/components/AppShell";
import { GlassSegmented } from "@/components/glass";
import { Head } from "@/seo/Head";

export default function Settings() {
  const { settings, updateSettings, t, uiLang } = useApp();
  const [downloadPct, setDownloadPct] = useState<number | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime, setNotifTime] = useState("08:00");
  const [adFreeMsg, setAdFreeMsg] = useState<string | null>(null);

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
      <Head pageKey="settings" lang={uiLang} />
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
            <GlassSegmented
              isRtl={uiLang === "ur"}
              value={settings.theme}
              onChange={(id) => updateSettings({ theme: id as ThemeMode })}
              ariaLabel={t.settings.theme}
              items={[
                { id: "dark", label: uiLang === "ur" ? "مڈنائٹ گلاس" : "Midnight Glass" },
                { id: "light", label: uiLang === "ur" ? "مون لائٹ گلاس" : "Moonlight Glass" },
                { id: "auto", label: t.settings.themeAuto },
              ]}
            />
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

          {/* Quran Script (IndoPak vs Madani) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {uiLang === "ur" ? "قرآنی رسم الخط" : "Quran Script"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "indopak" as const,
                    label: uiLang === "ur" ? "انڈو پاک (نستعلیق)" : "IndoPak (South Asian)",
                  },
                  {
                    id: "madani" as const,
                    label: uiLang === "ur" ? "مدنی (مصحفِ مدینہ / عثمانی)" : "Madani (Uthmani HAFS)",
                  },
                ]
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateSettings({ script: s.id })}
                  className={`px-4 py-2.5 rounded-xl text-sm border text-start transition-colors ${
                    (settings.script ?? (uiLang === "ur" ? "indopak" : "madani")) === s.id
                      ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                      : "border-[var(--border-subtle)] text-[var(--text-primary)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
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

          {/* Hijri ±1 day adjustment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {uiLang === "ur" ? "ہجری تاریخ ایڈجسٹمنٹ" : "Hijri Date Adjustment"}
            </label>
            <div className="flex gap-2">
              {([-1, 0, 1] as const).map((offset) => (
                <button
                  key={offset}
                  type="button"
                  onClick={() => updateSettings({ hijriOffset: offset })}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                    settings.hijriOffset === offset
                      ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                      : "border-[var(--border-subtle)] text-[var(--text-primary)]"
                  }`}
                >
                  {offset === 0 ? "0" : offset > 0 ? "+1" : "-1"}
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

          {/* Daily Verse Notification & Privacy / Ad-free options */}
          <div className="border-t border-[var(--border-subtle)] pt-5 space-y-4">
            {isNative() && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifEnabled}
                    onChange={async (e) => {
                      const next = e.target.checked;
                      const [h, m] = notifTime.split(":").map(Number);
                      const ok = await scheduleDailyVerseNotification(
                        next,
                        h || 8,
                        m || 0,
                        uiLang
                      );
                      setNotifEnabled(next && ok);
                    }}
                    className="w-4 h-4 accent-[#C9A227]"
                  />
                  {uiLang === "ur" ? "آج کی آیت روزانہ یاددہانی" : "Daily Verse Reminder"}
                </label>
                <input
                  type="time"
                  value={notifTime}
                  onChange={(e) => setNotifTime(e.target.value)}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-1 text-xs"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {isNative() && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await adService.showRewardedFor24hAdFree();
                    if (ok) {
                      setAdFreeMsg(
                        uiLang === "ur"
                          ? "24 گھنٹے کے لیے اشتہارات بند کر دیے گئے ہیں۔"
                          : "Ad-free mode enabled for 24 hours."
                      );
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--gold)] bg-[var(--gold)]/15 text-xs font-medium text-[var(--accent-gold)]"
                >
                  اشتہار دیکھیں اور 24 گھنٹے بغیر اشتہار
                </button>
              )}

              <button
                type="button"
                onClick={() => adService.showPrivacyOptions()}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {uiLang === "ur"
                  ? "پرائیویسی کی ترتیبات / Privacy options"
                  : "Privacy options / پرائیویسی کی ترتیبات"}
              </button>
            </div>
            {adFreeMsg && <p className="text-xs text-[var(--accent-gold)]">{adFreeMsg}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
