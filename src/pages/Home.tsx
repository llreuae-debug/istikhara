import { Link } from "react-router-dom";
import { BookOpen, Film, History, Sparkles, Sun } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { getFormattedDates } from "@/lib/hijri";
import { ARTICLES } from "@/content/articles";
import { GUIDE_FAQS } from "@/content/guide";
import { SITE_CONFIG } from "@/config/site";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppFooter, AppHeader } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { AnswerSummary } from "@/components/AnswerSummary";
import { StoreBadges } from "@/components/StoreBadges";
import { AdSlot } from "@/components/AdSlot";
import { GlassCard } from "@/components/glass";
import { isNative } from "@/lib/platform";
import { Head } from "@/seo/Head";
import {
  buildOrganizationJsonLd,
  buildWebApplicationJsonLd,
  buildWebSiteJsonLd,
} from "@/seo/jsonld";

export default function Home() {
  const { t, uiLang, settings } = useApp();
  const isUrdu = uiLang === "ur";
  const dates = getFormattedDates(new Date(), settings.hijriOffset);

  return (
    <div className="min-h-dvh flex flex-col">
      <Head
        pageKey="home"
        lang={uiLang}
        jsonLd={[
          buildWebSiteJsonLd(uiLang),
          buildOrganizationJsonLd(),
          buildWebApplicationJsonLd(uiLang),
        ]}
      />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 px-4 py-8 sm:py-12 space-y-14">
        {/* Hero */}
        <GlassCard variant="glass-2" className="max-w-2xl mx-auto p-6 sm:p-10 text-center space-y-7">
          <h1 className="sr-only">
            {isUrdu
              ? "استخارہ — قرآنی آیات کے ذریعے الہٰی رہنمائی"
              : "Istikhara — Receive divine guidance through Quranic verse"}
          </h1>

          <Logo animated variant="stacked" size={88} />

          <div className="space-y-2">
            <p className="font-urdu-nastaliq text-xl sm:text-2xl text-[var(--text-primary)]" dir="rtl">
              قرآنی آیات کے ذریعے الہٰی رہنمائی
            </p>
            <p className="font-display-serif text-lg sm:text-xl text-[var(--accent-gold)] tracking-wide" dir="ltr">
              Receive divine guidance through Quranic verse
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full glass-1 glass-border-mask text-xs sm:text-sm text-[var(--text-secondary)]">
            <span>{isUrdu ? dates.hijriUr : dates.hijriEn}</span>
            <span aria-hidden="true" className="text-[var(--accent-gold)]">•</span>
            <span>{isUrdu ? dates.gregorianUr : dates.gregorianEn}</span>
          </div>

          <div className="pt-1">
            <Link
              to={`/${uiLang}/prepare`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full glass-3 glass-lens-glints glass-border-mask glass-cta-gold font-semibold text-base sm:text-lg shadow-[0_12px_36px_rgba(201,162,39,0.28)] hover:scale-[1.02] active:scale-[0.97] transition-transform"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>استخارہ شروع کریں / Begin Istikhara</span>
            </Link>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            {t.home.subtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <Link
              to={`/${uiLang}/guide`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] glass-1 glass-border-mask glass-hover-lift text-sm text-[var(--text-primary)]"
            >
              <BookOpen className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <span>{t.home.sunnahMethod}</span>
            </Link>

            <Link
              to={`/${uiLang}/daily`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] glass-1 glass-border-mask glass-hover-lift text-sm text-[var(--text-primary)]"
            >
              <Sun className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <span>{t.home.verseOfDay}</span>
            </Link>

            <Link
              to={`/${uiLang}/studio`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] glass-1 glass-border-mask glass-hover-lift text-sm text-[var(--text-primary)]"
            >
              <Film className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <span>{t.nav.studio}</span>
            </Link>

            <Link
              to={`/${uiLang}/history`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[16px] glass-1 glass-border-mask glass-hover-lift text-sm text-[var(--text-primary)]"
            >
              <History className="w-4 h-4 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <span>{t.home.myVerses}</span>
            </Link>
          </div>
        </GlassCard>

        {/* Below-the-fold SEO/AEO Content */}
        <section className="max-w-4xl mx-auto space-y-10 border-t border-[var(--border-subtle)] pt-12">
          <div className="space-y-3">
            <h2 className="font-display-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-gold)]">
              {isUrdu ? "استخارہ کیا ہے؟" : "What is Istikhara?"}
            </h2>
            <AnswerSummary
              isUrdu={isUrdu}
              text={
                isUrdu
                  ? "استخارہ اللہ تعالیٰ سے کسی اہم فیصلے میں خیر طلب کرنے کا مسنون عمل ہے۔ صحیح بخاری (1162) کے مطابق اس کا طریقہ دو رکعت نفل نماز اور دعائے استخارہ پڑھنا ہے۔ یہ ایپ آپ کو دعا، مسنون طریقہ اور قرآنی آیات پر غور و فکر فراہم کرتی ہے۔"
                  : "Istikhara is the Sunnah practice of asking Allah for guidance before an important decision by praying two voluntary rak'ahs and reciting the prophetic dua (Sahih al-Bukhari 1162). This app pairs the Sunnah guide with quiet reflection on Quranic verses."
              }
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-display-serif text-2xl font-semibold text-[var(--accent-gold)]">
              {isUrdu ? "یہ ایپ کیسے کام کرتی ہے؟" : "How This App Works"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  n: "1",
                  title: isUrdu ? "تیاری اور دعا" : "Prepare & Dua",
                  desc: isUrdu
                    ? "وضو، دو رکعت نفل کی یاددہانی اور صحیح بخاری کی دعا پڑھیں۔"
                    : "Review wudu, pray two rak'ahs, and recite the Bukhari 1162 dua.",
                },
                {
                  n: "2",
                  title: isUrdu ? "قلب کی توجہ" : "Focus Moment",
                  desc: isUrdu
                    ? "درود شریف پڑھتے ہوئے تسبیح کے تین دانوں پر دل مرکوز کریں۔"
                    : "Recite Durood Sharif and complete the 3-bead quiet focus.",
                },
                {
                  n: "3",
                  title: isUrdu ? "تدبر، PDF اور ویڈیو" : "Reflect, PDF & Video",
                  desc: isUrdu
                    ? "قرآنی آیت مع مستند ترجمہ، تفسیر لنک، PDF اور ویڈیو حاصل کریں۔"
                    : "Read the verse with verified translations, tafsir link, PDF, or MP4.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-2"
                >
                  <span className="inline-flex w-8 h-8 rounded-full border border-[var(--gold)] items-center justify-center text-sm font-bold text-[var(--accent-gold)]">
                    {s.n}
                  </span>
                  <h3 className="font-semibold text-[var(--text-primary)]">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 4 Articles */}
          <div className="space-y-4">
            <h2 className="font-display-serif text-2xl font-semibold text-[var(--accent-gold)]">
              {isUrdu ? "رہنما مضامین" : "Essential Guides"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARTICLES.slice(0, 4).map((a) => (
                <Link
                  key={a.slug}
                  to={`/${uiLang}/${a.slug}`}
                  className="rounded-xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-4 hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <h3 className="font-medium text-sm sm:text-base text-[var(--text-primary)]">
                    {isUrdu ? a.titleUr : a.titleEn}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                    {isUrdu ? a.summaryUr : a.summaryEn}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display-serif text-2xl font-semibold text-[var(--accent-gold)]">
                {isUrdu ? "اکثر پوچھے گئے سوالات" : "Frequently Asked Questions"}
              </h2>
              <Link
                to={`/${uiLang}/faq`}
                className="text-xs text-[var(--accent-gold)] underline"
              >
                {isUrdu ? "تمام سوالات دیکھیں" : "View all FAQs"}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GUIDE_FAQS.slice(0, 2).map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-1.5"
                >
                  <h3 className="font-medium text-sm text-[var(--text-primary)]">
                    {isUrdu ? f.questionUr : f.questionEn}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isUrdu ? f.answerUr : f.answerEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Get the App (web only) */}
          {!isNative() && (
            <div className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-start">
                <h2 className="font-display-serif text-2xl font-semibold text-[var(--accent-gold)]">
                  {isUrdu ? "موبائل ایپ ڈاؤن لوڈ کریں" : "Get the Istikhara Mobile App"}
                </h2>
                <ul className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-1">
                  <li>✓ {isUrdu ? "مکمل آف لائن قرآن اور تفاسیر" : "Works completely offline"}</li>
                  <li>✓ {isUrdu ? "روزانہ آج کی آیت کی یاددہانی" : "Daily Verse of the Day notification"}</li>
                  <li>✓ {isUrdu ? "PDF اور 9:16 ویڈیو براہِ راست گیلری میں محفوظ کریں" : "Save PDFs & MP4 videos straight to gallery"}</li>
                </ul>
                <div className="pt-2">
                  <StoreBadges placement="home_section" showDesktopQr />
                </div>
              </div>
              <div
                aria-hidden="true"
                className="w-40 h-72 rounded-[28px] border-2 border-[var(--gold)]/60 bg-gradient-to-b from-[#0B3D2E] to-[#0A1A2F] p-4 flex flex-col items-center justify-center gap-3 shadow-xl shrink-0"
              >
                <Logo size={48} variant="mark" />
                <span className="font-urdu-nastaliq text-sm text-[#E6CF7A]">استخارہ</span>
                <span className="text-[10px] text-[#F7F1E3]/70">Android &amp; iOS</span>
              </div>
            </div>
          )}

          <AdSlot format="banner" slotKey="home" />
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
