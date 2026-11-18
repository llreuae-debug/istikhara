import { Link } from "react-router-dom";
import { SITE_CONFIG } from "@/config/site";
import { getArticleBySlug } from "@/content/articles";
import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AnswerSummary } from "@/components/AnswerSummary";
import { KeyTakeaways } from "@/components/KeyTakeaways";
import { AdSlot } from "@/components/AdSlot";
import { Head } from "@/seo/Head";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/seo/jsonld";

export default function ArticlePage({ slug }: { slug: string }) {
  const { uiLang, isRtl, t } = useApp();
  const article = getArticleBySlug(slug);

  if (!article) return null;

  const isUrdu = uiLang === "ur";
  const title = isUrdu ? article.titleUr : article.titleEn;
  const summary = isUrdu ? article.summaryUr : article.summaryEn;
  const url = `${SITE_CONFIG.appUrl}/${uiLang}/${article.slug}`;

  return (
    <div className="min-h-dvh flex flex-col">
      <Head
        pageKey={article.slug}
        lang={uiLang}
        title={title}
        description={summary.slice(0, 155)}
        canonicalPath={`/${uiLang}/${article.slug}`}
        jsonLd={[
          buildArticleJsonLd({
            headline: title,
            lang: uiLang,
            url,
            image: `${SITE_CONFIG.appUrl}/og/${article.slug}-${uiLang}.png`,
            datePublished: article.lastUpdated,
            dateModified: article.lastUpdated,
          }),
          buildBreadcrumbJsonLd([
            { name: t.nav.home, url: `${SITE_CONFIG.appUrl}/${uiLang}/` },
            { name: title, url },
          ]),
        ]}
      />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        <Breadcrumbs
          isRtl={isRtl}
          items={[
            { label: t.nav.home, to: `/${uiLang}/` },
            { label: title },
          ]}
        />

        <article className="space-y-6">
          <header className="space-y-2">
            <h1
              className={`font-semibold text-[var(--accent-gold)] ${
                isUrdu
                  ? "font-urdu-nastaliq text-2xl sm:text-3xl"
                  : "font-display-serif text-3xl sm:text-4xl"
              }`}
            >
              {title}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {isUrdu ? "آخری اپ ڈیٹ:" : "Last updated:"} {article.lastUpdated} •{" "}
              {isUrdu ? "نظر ثانی:" : "Reviewed by:"} {SITE_CONFIG.reviewer.name}
            </p>
          </header>

          <AnswerSummary text={summary} isUrdu={isUrdu} />

          {article.sections.map((sec, idx) => (
            <div key={sec.headingEn} className="space-y-6">
              <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-2">
                <h2
                  className={`font-semibold text-[var(--text-primary)] ${
                    isUrdu ? "font-urdu-nastaliq text-lg" : "font-display-serif text-xl"
                  }`}
                >
                  {isUrdu ? sec.headingUr : sec.headingEn}
                </h2>
                <p
                  className={`text-sm text-[var(--text-secondary)] ${
                    isUrdu ? "font-urdu-nastaliq" : "leading-relaxed"
                  }`}
                >
                  {isUrdu ? sec.bodyUr : sec.bodyEn}
                </p>
              </section>
              {idx === 1 && <AdSlot format="inline" slotKey="article" />}
            </div>
          ))}

          <KeyTakeaways
            title={isUrdu ? "اہم نکات" : "Key Takeaways"}
            points={isUrdu ? article.takeawaysUr : article.takeawaysEn}
            isUrdu={isUrdu}
          />

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/${uiLang}/prepare`}
              className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
            >
              {t.home.beginCta}
            </Link>
            <Link
              to={`/${uiLang}/dua`}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)]"
            >
              {isUrdu ? "دعائے استخارہ" : "Istikhara Dua"}
            </Link>
          </div>

          {/* Sources */}
          <footer className="border-t border-[var(--border-subtle)] pt-4 space-y-2 text-xs text-[var(--text-muted)]">
            <p className="font-semibold">{isUrdu ? "مستند ماخذ:" : "Sources:"}</p>
            <ul className="flex flex-wrap gap-3">
              {article.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[var(--accent-gold)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </article>
      </main>
    </div>
  );
}
