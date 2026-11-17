import { Link } from "react-router-dom";
import { GUIDE_FAQS } from "@/content/guide";
import { SITE_CONFIG } from "@/config/site";
import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Head } from "@/seo/Head";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/seo/jsonld";

export default function FaqPage() {
  const { uiLang, isRtl, t } = useApp();
  const isUrdu = uiLang === "ur";
  const title = isUrdu
    ? "استخارہ کے سوالات اور جوابات"
    : "Istikhara — Frequently Asked Questions";

  const rows = GUIDE_FAQS.map((f) => ({
    id: f.id,
    question: isUrdu ? f.questionUr : f.questionEn,
    answer: isUrdu ? f.answerUr : f.answerEn,
  }));

  return (
    <div className="min-h-dvh flex flex-col">
      <Head
        pageKey="faq"
        lang={uiLang}
        jsonLd={[
          buildFaqJsonLd(rows),
          buildBreadcrumbJsonLd([
            { name: t.nav.home, url: `${SITE_CONFIG.appUrl}/${uiLang}/` },
            { name: title, url: `${SITE_CONFIG.appUrl}/${uiLang}/faq` },
          ]),
        ]}
      />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <Breadcrumbs
          isRtl={isRtl}
          items={[{ label: t.nav.home, to: `/${uiLang}/` }, { label: title }]}
        />

        <h1
          className={`font-semibold text-[var(--accent-gold)] ${
            isUrdu
              ? "font-urdu-nastaliq text-2xl sm:text-3xl"
              : "font-display-serif text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </h1>

        <FaqAccordion items={rows} isUrdu={isUrdu} />

        <div className="pt-2">
          <Link
            to={`/${uiLang}/prepare`}
            className="inline-block px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
          >
            {t.home.beginCta}
          </Link>
        </div>
      </main>
    </div>
  );
}
