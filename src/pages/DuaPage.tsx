import { useState } from "react";
import { Link } from "react-router-dom";
import { ISTIKHARA_DUA } from "@/content/dua";
import { SITE_CONFIG } from "@/config/site";
import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AnswerSummary } from "@/components/AnswerSummary";
import { Head } from "@/seo/Head";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/seo/jsonld";

export default function DuaPage() {
  const { uiLang, isRtl, t } = useApp();
  const [showHint, setShowHint] = useState(false);
  const isUrdu = uiLang === "ur";
  const title = isUrdu
    ? "دعائے استخارہ مع اردو و انگریزی ترجمہ"
    : "Istikhara Dua (Sahih al-Bukhari 1162)";

  return (
    <div className="min-h-dvh flex flex-col">
      <Head
        pageKey="dua"
        lang={uiLang}
        jsonLd={[
          buildArticleJsonLd({
            headline: title,
            lang: uiLang,
            url: `${SITE_CONFIG.appUrl}/${uiLang}/dua`,
            image: `${SITE_CONFIG.appUrl}/og/dua-${uiLang}.png`,
            datePublished: "2026-11-18",
            dateModified: "2026-11-18",
          }),
          buildBreadcrumbJsonLd([
            { name: t.nav.home, url: `${SITE_CONFIG.appUrl}/${uiLang}/` },
            { name: title, url: `${SITE_CONFIG.appUrl}/${uiLang}/dua` },
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

        <AnswerSummary
          isUrdu={isUrdu}
          text={
            isUrdu
              ? "دعائے استخارہ صحیح بخاری (حدیث 1162) میں وارد مسنون دعا ہے جو دو رکعت نفل نماز کے بعد پڑھی جاتی ہے۔ اس میں اللہ کے علم اور قدرت کے ذریعے خیر طلب کی جاتی ہے۔"
              : "The Istikhara dua from Sahih al-Bukhari (1162) is recited after praying two voluntary rak'ahs, asking Allah by His knowledge and power to ordain what is best."
          }
        />

        <section className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-5 sm:p-8 space-y-5">
          <div
            dir="rtl"
            className="font-arabic-quran text-xl sm:text-2xl text-[var(--text-primary)] leading-loose text-center"
          >
            <span>{ISTIKHARA_DUA.arabic.beforeMatter}</span>
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="mx-1 px-2 py-0.5 rounded-lg bg-[var(--gold)]/20 border border-[var(--gold)] text-[var(--accent-gold)]"
            >
              {ISTIKHARA_DUA.arabic.matterPhrase}
            </button>
            <span>{ISTIKHARA_DUA.arabic.middle}</span>
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="mx-1 px-2 py-0.5 rounded-lg bg-[var(--gold)]/20 border border-[var(--gold)] text-[var(--accent-gold)]"
            >
              {ISTIKHARA_DUA.arabic.secondMatterPhrase}
            </button>
            <span>{ISTIKHARA_DUA.arabic.afterMatter}</span>
          </div>

          {showHint && (
            <p className="rounded-xl border border-[var(--gold)]/50 bg-[var(--gold)]/10 p-3 text-xs sm:text-sm text-[var(--accent-gold)] text-center">
              {isUrdu ? ISTIKHARA_DUA.urdu.matterHint : ISTIKHARA_DUA.english.matterHint}
            </p>
          )}

          <p className="text-xs sm:text-sm italic text-[var(--text-muted)] leading-relaxed" dir="ltr">
            {ISTIKHARA_DUA.transliteration}
          </p>

          <p className="font-urdu-nastaliq text-base text-[var(--text-primary)]/90" dir="rtl">
            {ISTIKHARA_DUA.urdu.text}
          </p>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed" dir="ltr">
            {ISTIKHARA_DUA.english.text}
          </p>

          <p className="text-xs text-[var(--text-muted)]">
            Source:{" "}
            <a
              href="https://sunnah.com/bukhari:1162"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent-gold)]"
            >
              Sahih al-Bukhari 1162 (sunnah.com)
            </a>
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/${uiLang}/prepare`}
            className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
          >
            {t.home.beginCta}
          </Link>
          <Link
            to={`/${uiLang}/guide`}
            className="px-5 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm"
          >
            {t.nav.guide}
          </Link>
        </div>
      </main>
    </div>
  );
}
