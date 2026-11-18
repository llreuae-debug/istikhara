import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";

export default function About() {
  const { t, uiLang } = useApp();

  return (
    <div className="min-h-dvh flex flex-col">
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
          {t.about.title}
        </h1>

        <section className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] backdrop-blur-md p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display-serif text-xl font-semibold text-[var(--accent-gold)]">
              {t.about.purposeTitle}
            </h2>
            <p
              className={`text-sm text-[var(--text-secondary)] ${
                uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
              }`}
            >
              {t.about.purposeBody}
            </p>
          </div>

          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <h2 className="font-display-serif text-xl font-semibold text-[var(--accent-gold)]">
              {t.about.sourcesTitle}
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
              <li>Quranic Arabic &amp; Scripts: Al-Quran Cloud (`quran-uthmani`), QUL / Quran.com (`qpc-hafs` &amp; `qul-indopak`)</li>
              <li>Urdu Translation: Maulana Fateh Muhammad Jalandhry (ur.jalandhry)</li>
              <li>English Translation: Sahih International (en.sahih)</li>
              <li>Audio Recitations &amp; Timings: Mishary Alafasy, Abdul Basit Murattal, Mahmoud Al-Husary (EveryAyah / QUL / quran-align)</li>
              <li>Fonts (Self-Hosted): KFGQPC Uthmanic Script HAFS, Indopak Nastaleeq (QUL), Amiri Quran, Scheherazade New, Noto Nastaliq Urdu, Gulzar, Reem Kufi, Aref Ruqaa, Cormorant Garamond, Inter (OFL-1.1 / KFGQPC License)</li>
              <li>Tafsir Reference: Quran.com</li>
              <li>Istikhara Dua: Sahih al-Bukhari 1162</li>
            </ul>
          </div>

          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <h2 className="font-display-serif text-xl font-semibold text-[var(--accent-gold)]">
              {t.about.privacyTitle}
            </h2>
            <p
              className={`text-sm text-[var(--text-secondary)] ${
                uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
              }`}
            >
              {t.about.privacyBody}
            </p>
          </div>

          <div className="space-y-1 border-t border-[var(--border-subtle)] pt-4">
            <h2 className="font-display-serif text-xl font-semibold text-[var(--accent-gold)]">
              {t.about.contactTitle}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]" dir="ltr">
              contact@istikhara.app
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
