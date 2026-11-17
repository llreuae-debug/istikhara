import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Head } from "@/seo/Head";

export default function Privacy() {
  const { t, uiLang } = useApp();
  const isUrdu = uiLang === "ur";

  return (
    <div className="min-h-dvh flex flex-col">
      <Head pageKey="privacy" lang={uiLang} />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
          {t.about.privacyTitle}
        </h1>
        <section className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-6 space-y-4">
          <p className={isUrdu ? "font-urdu-nastaliq text-sm" : "text-sm leading-relaxed text-[var(--text-secondary)]"}>
            {t.about.privacyBody}
          </p>
        </section>
      </main>
    </div>
  );
}
