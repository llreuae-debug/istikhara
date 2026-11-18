import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SITE_CONFIG } from "@/config/site";
import { useApp } from "@/lib/i18n";
import { getAyah, type FetchedAyah } from "@/lib/quran";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VerseCard } from "@/components/VerseCard";
import { Head } from "@/seo/Head";
import { buildBreadcrumbJsonLd } from "@/seo/jsonld";

export default function VerseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { uiLang, isRtl, t } = useApp();
  const [ayah, setAyah] = useState<FetchedAyah | null>(null);
  const [loading, setLoading] = useState(true);

  const ref = (slug || "3-159").replace("-", ":");

  useEffect(() => {
    setLoading(true);
    getAyah(ref)
      .then(setAyah)
      .finally(() => setLoading(false));
  }, [ref]);

  const title = ayah
    ? `${ayah.surahNameEn} ${ayah.surahNumber}:${ayah.ayahNumber}`
    : ref;

  return (
    <div className="min-h-dvh flex flex-col">
      <Head
        pageKey="verses"
        lang={uiLang}
        title={`${title} | ${SITE_CONFIG.appName}`}
        canonicalPath={`/${uiLang}/verses/${slug}`}
        jsonLd={[
          buildBreadcrumbJsonLd([
            { name: t.nav.home, url: `${SITE_CONFIG.appUrl}/${uiLang}/` },
            { name: t.nav.verses, url: `${SITE_CONFIG.appUrl}/${uiLang}/verses` },
            { name: title, url: `${SITE_CONFIG.appUrl}/${uiLang}/verses/${slug}` },
          ]),
        ]}
      />
      <GeometricBackground brighten />
      <AppHeader />

      <main className="flex-1 min-h-[85dvh] max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <Breadcrumbs
          isRtl={isRtl}
          items={[
            { label: t.nav.home, to: `/${uiLang}/` },
            { label: t.nav.verses, to: `/${uiLang}/verses` },
            { label: title },
          ]}
        />

        <h1 className="font-display-serif text-2xl sm:text-3xl font-semibold text-center text-[var(--accent-gold)]">
          {ayah
            ? `${ayah.surahNameAr} • ${ayah.surahNameEn} (${ayah.surahNumber}:${ayah.ayahNumber})`
            : `Quran ${ref}`}
        </h1>

        {loading && (
          <div className="max-w-3xl w-full mx-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-8 min-h-[540px]">
            <div className="h-16 w-full rounded-xl mushaf-shimmer" />
          </div>
        )}

        {ayah && !loading && (
          <VerseCard
            ayah={ayah}
            animateReveal={false}
            ctaSlot={
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to={`/${uiLang}/studio?s=${ayah.surahNumber}&a=${ayah.ayahNumber}`}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--accent-gold)]"
                >
                  🎬 {uiLang === "ur" ? "ویڈیو بنائیں" : "Create Video"}
                </Link>
                <Link
                  to={`/${uiLang}/prepare`}
                  className="px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
                >
                  {t.home.beginCta}
                </Link>
              </div>
            }
          />
        )}
      </main>
    </div>
  );
}
