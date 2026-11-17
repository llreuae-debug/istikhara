import { motion, useReducedMotion } from "framer-motion";
import { useApp } from "@/lib/i18n";

export function BreathingRing({ size = 210 }: { size?: number }) {
  const prefersReduced = useReducedMotion();
  const { settings } = useApp();
  const animate = settings.animations && !prefersReduced;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 rounded-full border border-[var(--gold)]/45"
        animate={
          animate
            ? { scale: [0.9, 1.08, 0.9], opacity: [0.35, 0.8, 0.35] }
            : undefined
        }
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-4 rounded-full border border-[var(--gold-soft)]/30"
        animate={
          animate
            ? { scale: [1.04, 0.92, 1.04], opacity: [0.25, 0.65, 0.25] }
            : undefined
        }
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
