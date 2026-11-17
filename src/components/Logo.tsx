import { motion, useReducedMotion } from "framer-motion";
import { useApp } from "@/lib/i18n";

interface LogoProps {
  animated?: boolean;
  variant?: "horizontal" | "stacked" | "mark";
  size?: number;
}

export function Logo({
  animated = false,
  variant = "horizontal",
  size = 56,
}: LogoProps) {
  const prefersReduced = useReducedMotion();
  const { settings } = useApp();
  const shouldAnimate = animated && settings.animations && !prefersReduced;

  const mark = (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <defs>
        <radialGradient id="logoLightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E6CF7A" stopOpacity="1" />
          <stop offset="45%" stopColor="#C9A227" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logoGoldShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="50%" stopColor="#E6CF7A" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
      </defs>

      {/* Square 1 */}
      <motion.rect
        x="26"
        y="26"
        width="68"
        height="68"
        stroke="url(#logoGoldShimmer)"
        strokeWidth="2"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0.4 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Square 2 rotating 45 deg into 8-pointed Rub el Hizb */}
      <motion.rect
        x="26"
        y="26"
        width="68"
        height="68"
        stroke="url(#logoGoldShimmer)"
        strokeWidth="2"
        style={{ originX: "60px", originY: "60px" }}
        initial={
          shouldAnimate
            ? { pathLength: 0, rotate: 0, opacity: 0.4 }
            : { rotate: 45, opacity: 1 }
        }
        animate={{ pathLength: 1, rotate: 45, opacity: 1 }}
        transition={{
          pathLength: { duration: 1.2, ease: "easeInOut" },
          rotate: { duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.6 },
        }}
      />

      {/* Open book (two curved strokes) */}
      <motion.path
        d="M40 69 C47 64, 54 64, 60 69 C66 64, 73 64, 80 69"
        stroke="#C9A227"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.65, delay: 1.1, ease: "easeOut" }}
      />
      <motion.path
        d="M40 74 C47 69, 54 69, 60 74 C66 69, 73 69, 80 74"
        stroke="#C9A227"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 0.72 }}
        transition={{ duration: 0.65, delay: 1.25, ease: "easeOut" }}
      />

      {/* Single point of light */}
      <motion.circle
        cx="60"
        cy="48"
        r="11"
        fill="url(#logoLightGlow)"
        initial={shouldAnimate ? { scale: 0, opacity: 0 } : false}
        animate={
          shouldAnimate
            ? { scale: [0, 1.35, 1, 1.15, 1], opacity: [0, 1, 0.9, 1, 0.9] }
            : { scale: 1, opacity: 0.9 }
        }
        transition={{
          duration: 1.2,
          delay: 1.5,
          repeat: shouldAnimate ? Infinity : 0,
          repeatDelay: 8,
        }}
      />
      <motion.circle
        cx="60"
        cy="48"
        r="3.2"
        fill="#E6CF7A"
        initial={shouldAnimate ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, delay: 1.5 }}
      />
    </motion.svg>
  );

  if (variant === "mark") return mark;

  if (variant === "stacked") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        {mark}
        <div className="flex items-baseline gap-3" dir="ltr">
          <span className="font-display-serif text-3xl sm:text-4xl font-semibold tracking-wide text-[var(--text-primary)]">
            Istikhara
          </span>
          <span className="font-urdu-nastaliq text-2xl sm:text-3xl text-[var(--accent-gold)]">
            استخارہ
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3" dir="ltr">
      {mark}
      <div className="flex items-baseline gap-2.5">
        <span className="font-display-serif text-2xl font-semibold tracking-wide text-[var(--text-primary)]">
          Istikhara
        </span>
        <span className="font-urdu-nastaliq text-lg text-[var(--accent-gold)]">
          استخارہ
        </span>
      </div>
    </div>
  );
}
