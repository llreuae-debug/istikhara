import { SITE_CONFIG } from "@/config/site";
import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Head } from "@/seo/Head";

export default function Contact() {
  const { t, uiLang } = useApp();

  return (
    <div className="min-h-dvh flex flex-col">
      <Head pageKey="contact" lang={uiLang} />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
          {t.about.contactTitle}
        </h1>
        <section className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-6 space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            {uiLang === "ur"
              ? "تصحیح، مشورہ یا علمی نظرثانی کے لیے رابطہ کریں:"
              : "For feedback, corrections, or scholar review inquiries:"}
          </p>
          <a
            href={`mailto:${SITE_CONFIG.contactEmail}`}
            className="text-base font-semibold text-[var(--accent-gold)] underline"
            dir="ltr"
          >
            {SITE_CONFIG.contactEmail}
          </a>
        </section>
      </main>
    </div>
  );
}
