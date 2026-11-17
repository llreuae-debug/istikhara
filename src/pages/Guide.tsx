import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { GUIDE_FAQS, SUNNAH_STEPS } from "@/content/guide";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";

export default function Guide() {
  const { uiLang, t } = useApp();
  const [openFaq, setOpenFaq] = useState<string | null>(GUIDE_FAQS[0].id);

  return (
    <div className="min-h-dvh flex flex-col">
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
        <header className="text-center space-y-2">
          <h1 className="font-display-serif text-3xl sm:text-4xl font-semibold text-[var(--accent-gold)]">
            {t.nav.guide}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {uiLang === "ur"
              ? "صحیح بخاری (1162) کی روشنی میں مسنون طریقہ"
              : "Step-by-step Sunnah method based on Sahih al-Bukhari 1162"}
          </p>
        </header>

        {/* 5 Illustrated Steps */}
        <section className="space-y-4">
          {SUNNAH_STEPS.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] backdrop-blur-md p-5 sm:p-6 flex items-start gap-4"
            >
              <span className="shrink-0 w-10 h-10 rounded-full border border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--accent-gold)] font-display-serif text-lg font-bold flex items-center justify-center">
                {step.number}
              </span>
              <div className="space-y-1.5">
                <h2
                  className={`text-lg font-semibold text-[var(--text-primary)] ${
                    uiLang === "ur" ? "font-urdu-nastaliq" : "font-display-serif text-xl"
                  }`}
                >
                  {uiLang === "ur" ? step.titleUr : step.titleEn}
                </h2>
                <p
                  className={`text-sm text-[var(--text-secondary)] ${
                    uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
                  }`}
                >
                  {uiLang === "ur" ? step.bodyUr : step.bodyEn}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-4">
          <h2 className="font-display-serif text-2xl font-semibold text-[var(--accent-gold)] text-center">
            {uiLang === "ur" ? "اکثر پوچھے جانے والے سوالات" : "Frequently Asked Questions"}
          </h2>

          <div className="space-y-3">
            {GUIDE_FAQS.map((item) => {
              const isOpen = openFaq === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : item.id)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-3 text-start"
                  >
                    <span
                      className={`font-medium text-sm sm:text-base text-[var(--text-primary)] ${
                        uiLang === "ur" ? "font-urdu-nastaliq" : ""
                      }`}
                    >
                      {uiLang === "ur" ? item.questionUr : item.questionEn}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-[var(--accent-gold)] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 border-t border-[var(--border-subtle)]">
                      <p
                        className={`text-sm text-[var(--text-secondary)] ${
                          uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
                        }`}
                      >
                        {uiLang === "ur" ? item.answerUr : item.answerEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="text-center pt-2">
          <Link
            to="/prepare"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)] transition-colors"
          >
            {t.home.beginCta}
          </Link>
        </div>
      </main>
    </div>
  );
}
