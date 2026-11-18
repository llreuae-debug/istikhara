import { useApp } from "@/lib/i18n";
import { adService } from "@/lib/ads/adService";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppFooter, AppHeader } from "@/components/AppShell";
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
        <section className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-6 space-y-4 text-sm text-[var(--text-secondary)]">
          <p className={isUrdu ? "font-urdu-nastaliq" : "leading-relaxed"}>
            {t.about.privacyBody}
          </p>

          <h2 className="font-display-serif text-lg font-semibold text-[var(--accent-gold)]">
            {isUrdu ? "اشتہارات اور رضامندی (AdMob / AdSense)" : "Advertising & Consent (AdMob / AdSense)"}
          </h2>
          <p className={isUrdu ? "font-urdu-nastaliq" : "leading-relaxed"}>
            {isUrdu
              ? "موبائل ایپ میں Google AdMob اور ویب سائٹ پر Google AdSense صرف صارف کی رضامندی (UMP / ATT / CMP) کے بعد چلائے جاتے ہیں۔ آپ کی نجی نیت، نوٹ یا تلاوت کی تاریخ کبھی اشتہاری نیٹ ورکس کو نہیں بھیجی جاتی۔ قرآنی متن، دعا، تیاری، توجہ، PDF یا ویڈیو میں کوئی اشتہار نہیں دکھایا جاتا۔"
              : "Google AdMob (mobile apps) and Google AdSense (web) load only after applicable user consent (Google UMP / iOS ATT / CMP). Your private intention notes, bookmarks, and journal entries never leave your device and are never shared with ad networks. No ads ever appear near Quranic text, in Prepare/Focus, during recitation, or in exported PDFs, images, or videos."}
          </p>

          <button
            type="button"
            onClick={() => adService.showPrivacyOptions()}
            className="px-4 py-2 rounded-xl border border-[var(--border-gold)] text-xs font-medium text-[var(--accent-gold)]"
          >
            {isUrdu ? "پرائیویسی کی ترتیبات کھولیں" : "Manage Privacy Options"}
          </button>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
