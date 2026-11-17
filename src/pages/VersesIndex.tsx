import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { REFLECTION_SET } from "@/content/reflectionSet";
import { SITE_CONFIG } from "@/config/site";
import { useApp } from "@/lib/i18n";
import { getAyah, type FetchedAyah } from "@/lib/quran";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Head } from "@/seo/Head";
import { buildBreadcrumbJsonLd } from "@/seo/jsonld";

export default function VersesIndex() {
  const { uiLang, isRtl, t } = useApp();
  const isUrdu = uiLang === "ur";
  const [items, setItems] = useState<FetchedAyah[]>([]);

  useEffect(() => {
    Promise.all(REFLECTION_SET.map((ref) => getAyah(ref)))
      .then(setItems)
      .catch(() => {});
  }, []);

  const title = isUrdu
    ? "منتخب قرآنی آیاتِ رہنمائی و صبر"
    : "Reflection Set — 40 Quranic Verses";

  return (
    <div className="min-h-dvh flex flex-col">
      <Head
        pageKey="verses"
        lang={uiLang}
        jsonLd={[
          buildBreadcrumbJsonLd([
            { name: t.nav.home, url: `${SITE_CONFIG.appUrl}/${uiLang}/` },
            { name: title, url: `${SITE_CONFIG.appUrl}/${uiLang}/verses` },
          ]),
        ]}
      />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((a) => (
            <Link
              key={`${a.surahNumber}-${a.ayahNumber}`}
              to={`/${uiLang}/verses/${a.surahNumber}-${a.ayahNumber}`}
              className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-5 space-y-2 hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-[var(--accent-gold)]">
                <span>
                  {a.surahNameEn} ({a.surahNumber}:{a.ayahNumber})
                </span>
                <span className="font-arabic-quran text-sm">{a.surahNameAr}</span>
              </div>
              <p className="font-arabic-quran text-lg text-[var(--text-primary)] line-clamp-2" dir="rtl">
                {a.arabicText} ﴿{a.ayahNumber}﴾
              </p>
              <p
                className={`text-xs text-[var(--text-secondary)] line-clamp-2 ${
                  isUrdu ? "font-urdu-nastaliq" : ""
                }`}
              >
                {isUrdu ? a.urduText : a.englishText}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
