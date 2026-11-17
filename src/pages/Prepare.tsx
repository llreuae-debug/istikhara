import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { ISTIKHARA_DUA } from "@/content/dua";
import {
  loadIntention,
  saveIntention,
  type IntentionCategory,
} from "@/lib/storage";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Head } from "@/seo/Head";
import { trackEvent } from "@/lib/analytics";

const CATEGORIES: IntentionCategory[] = [
  "marriage",
  "business",
  "job",
  "travel",
  "study",
  "property",
  "other",
];

export default function Prepare() {
  const { t, uiLang, isRtl } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showMatterHint, setShowMatterHint] = useState(false);
  const [intention, setIntention] = useState(() => loadIntention());

  const updateCategory = (category: IntentionCategory) => {
    const next = { ...intention, category };
    setIntention(next);
    saveIntention(next);
  };

  const updateNote = (note: string) => {
    const next = { ...intention, note };
    setIntention(next);
    saveIntention(next);
  };

  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-dvh flex flex-col">
      <Head pageKey="prepare" lang={uiLang} />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>{t.prepare.title}</span>
            <span>
              {t.prepare.stepLabel} {step} {t.prepare.of} 3
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-colors ${
                  s <= step ? "bg-[var(--gold)]" : "bg-[var(--border-subtle)]"
                }`}
              />
            ))}
          </div>
        </div>

        <section className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] backdrop-blur-md p-5 sm:p-8 shadow-xl space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h1 className="font-display-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-gold)]">
                {t.prepare.step1Title}
              </h1>
              <p
                className={`text-sm sm:text-base text-[var(--text-primary)]/90 ${
                  uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
                }`}
              >
                {t.prepare.step1Body}
              </p>
              <Link
                to={`/${uiLang}/guide`}
                className="inline-block text-sm text-[var(--accent-gold)] underline underline-offset-4 hover:text-[var(--gold-soft)]"
              >
                {t.prepare.step1Link}
              </Link>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h1 className="font-display-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-gold)]">
                {t.prepare.step2Title}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">{t.prepare.step2Body}</p>

              {/* Arabic Dua with interactive matter phrase */}
              <div
                dir="rtl"
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]/60 p-4 sm:p-5 font-arabic-quran text-xl sm:text-2xl text-[var(--text-primary)] leading-loose text-center"
              >
                <span>{ISTIKHARA_DUA.arabic.beforeMatter}</span>
                <button
                  type="button"
                  onClick={() => setShowMatterHint((v) => !v)}
                  className="mx-1 px-2 py-0.5 rounded-lg bg-[var(--gold)]/20 border border-[var(--gold)] text-[var(--accent-gold)] hover:bg-[var(--gold)]/30 transition-colors"
                >
                  {ISTIKHARA_DUA.arabic.matterPhrase}
                </button>
                <span>{ISTIKHARA_DUA.arabic.middle}</span>
                <button
                  type="button"
                  onClick={() => setShowMatterHint((v) => !v)}
                  className="mx-1 px-2 py-0.5 rounded-lg bg-[var(--gold)]/20 border border-[var(--gold)] text-[var(--accent-gold)] hover:bg-[var(--gold)]/30 transition-colors"
                >
                  {ISTIKHARA_DUA.arabic.secondMatterPhrase}
                </button>
                <span>{ISTIKHARA_DUA.arabic.afterMatter}</span>
              </div>

              {showMatterHint && (
                <div className="rounded-xl border border-[var(--gold)]/50 bg-[var(--gold)]/10 p-3 text-xs sm:text-sm text-[var(--accent-gold)] text-center">
                  {uiLang === "ur"
                    ? ISTIKHARA_DUA.urdu.matterHint
                    : ISTIKHARA_DUA.english.matterHint}
                </div>
              )}

              <p
                className={
                  uiLang === "ur"
                    ? "font-urdu-nastaliq text-sm sm:text-base text-[var(--text-secondary)]"
                    : "text-sm leading-relaxed text-[var(--text-secondary)]"
                }
              >
                {uiLang === "ur" ? ISTIKHARA_DUA.urdu.text : ISTIKHARA_DUA.english.text}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h1 className="font-display-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-gold)]">
                {t.prepare.step3Title}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">{t.prepare.step3Body}</p>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = intention.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateCategory(cat)}
                      className={`px-3.5 py-2 rounded-full text-sm border transition-colors ${
                        active
                          ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                          : "border-[var(--border-gold)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                      }`}
                    >
                      {t.categories[cat]}
                    </button>
                  );
                })}
              </div>

              {/* Private optional note */}
              <textarea
                rows={3}
                value={intention.note}
                onChange={(e) => updateNote(e.target.value)}
                placeholder={t.prepare.notePlaceholder}
                className="w-full rounded-xl border border-[var(--border-gold)] bg-[var(--bg-primary)]/70 p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />

              <div className="inline-flex items-center gap-2 text-xs text-[var(--accent-gold)]">
                <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t.prepare.privacyBadge}</span>
              </div>
            </div>
          )}

          {/* Step Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <BackArrow className="w-4 h-4" aria-hidden="true" />
                {t.prepare.back}
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)] transition-colors"
              >
                {t.prepare.next}
                <NextArrow className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  trackEvent({ name: "istikhara_started" });
                  navigate(`/${uiLang}/focus`);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)] transition-colors"
              >
                {t.prepare.continueToFocus}
                <NextArrow className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
