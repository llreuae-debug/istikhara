import { useRef, useState } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useApp } from "@/lib/i18n";
import { isNative } from "@/lib/platform";

interface TasbihBeadsProps {
  onComplete: () => void;
}

export function TasbihBeads({ onComplete }: TasbihBeadsProps) {
  const { settings, t } = useApp();
  const [count, setCount] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const vibrate = (ms: number) => {
    if (!settings.haptics) return;
    if (isNative()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      return;
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCount(3);
    vibrate(45);
    onComplete();
  };

  const handleTap = () => {
    if (completedRef.current) return;
    const next = Math.min(3, count + 1);
    setCount(next);
    vibrate(25);
    if (next >= 3) {
      completedRef.current = true;
      onComplete();
    }
  };

  const startHold = () => {
    if (completedRef.current) return;
    setHolding(true);
    holdTimerRef.current = window.setTimeout(() => {
      setHolding(false);
      complete();
    }, 3000);
  };

  const cancelHold = () => {
    setHolding(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* 3 bead indicators */}
      <div className="flex items-center gap-3" aria-label={`${count} / 3`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
              i < count
                ? "bg-[var(--gold)] border-[var(--gold-soft)] scale-110 shadow-[0_0_12px_rgba(201,162,39,0.65)]"
                : "border-[var(--border-gold)] bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Interactive tasbih bead */}
      <button
        type="button"
        onClick={handleTap}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        aria-label={t.focus.tasbihHint}
        className={`w-20 h-20 rounded-full border-2 border-[var(--gold)] flex items-center justify-center transition-transform duration-200 select-none ${
          holding
            ? "scale-95 bg-[var(--gold)]/25 shadow-[0_0_28px_rgba(201,162,39,0.55)]"
            : "bg-[var(--bg-card)] hover:scale-105 active:scale-95"
        }`}
      >
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E6CF7A] to-[#C9A227] shadow-inner" />
      </button>

      <p className="text-xs sm:text-sm text-[var(--text-secondary)] text-center max-w-xs">
        {count >= 3 ? t.focus.beadsDone : t.focus.tasbihHint}
      </p>
    </div>
  );
}
