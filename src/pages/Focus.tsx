import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { BreathingRing } from "@/components/BreathingRing";
import { TasbihBeads } from "@/components/TasbihBeads";
import { Head } from "@/seo/Head";

export default function Focus() {
  const { t, settings, uiLang } = useApp();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  const animate = settings.animations && !prefersReduced;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10 text-center">
      <Head pageKey="focus" lang={uiLang} />
      <GeometricBackground dimmed />

      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="font-display-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-gold)]">
            {t.focus.title}
          </h1>
          <p
            className={`text-base text-[var(--text-primary)]/90 ${
              uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
            }`}
          >
            {t.focus.prompt}
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <BreathingRing size={220} />
          <div className="absolute inset-0 flex items-center justify-center">
            <TasbihBeads onComplete={() => setReady(true)} />
          </div>
        </div>

        <div className="min-h-[68px] flex flex-col items-center justify-center gap-3">
          {ready ? (
            <motion.button
              type="button"
              initial={animate ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/${uiLang}/result`, { state: { fresh: true } })}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-base shadow-[0_10px_30px_rgba(201,162,39,0.3)] hover:bg-[var(--gold-soft)] transition-colors"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {t.focus.revealBtn}
            </motion.button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/${uiLang}/result`, { state: { fresh: true } })}
              className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-secondary)]"
            >
              {t.focus.skip}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
