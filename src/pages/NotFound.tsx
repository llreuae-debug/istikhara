import { Link } from "react-router-dom";
import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";

export default function NotFound() {
  const { uiLang, t } = useApp();
  const isUrdu = uiLang === "ur";

  return (
    <div className="min-h-dvh flex flex-col">
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-5">
        <h1 className="font-display-serif text-5xl font-bold text-[var(--accent-gold)]">
          404
        </h1>
        <p className={isUrdu ? "font-urdu-nastaliq text-lg" : "text-base text-[var(--text-secondary)]"}>
          {isUrdu ? "یہ صفحہ موجود نہیں ہے۔" : "This page could not be found."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to={`/${uiLang}/`}
            className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
          >
            {t.nav.home}
          </Link>
          <Link
            to={`/${uiLang}/prepare`}
            className="px-5 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm"
          >
            {t.home.beginCta}
          </Link>
        </div>
      </main>
    </div>
  );
}
