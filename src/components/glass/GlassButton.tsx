import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useMagneticCta, usePressRipple } from "@/lib/glass/useGlassInteraction";

export type GlassButtonVariant = "primary" | "secondary" | "ghost" | "icon";

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  magnetic?: boolean;
  children: ReactNode;
}

export function GlassButton({
  variant = "primary",
  magnetic = variant === "primary",
  className = "",
  children,
  onPointerDown,
  style,
  ...rest
}: GlassButtonProps) {
  const mag = useMagneticCta(4);
  const { ripples, triggerRipple } = usePressRipple();

  const variantClasses =
    variant === "primary"
      ? "rounded-full glass-3 glass-lens-glints glass-border-mask glass-cta-gold font-semibold px-6 py-3"
      : variant === "secondary"
        ? "rounded-full glass-2 glass-border-mask text-[var(--text-primary)] px-5 py-2.5 font-medium"
        : variant === "icon"
          ? "rounded-full glass-1 glass-border-mask text-[var(--text-secondary)] hover:text-[var(--accent-gold)] w-10 h-10 p-0"
          : "rounded-full border border-transparent hover:bg-[var(--glass-1-bg)] text-[var(--text-primary)] px-4 py-2 font-medium";

  return (
    <button
      type="button"
      onPointerMove={magnetic ? mag.onPointerMove : undefined}
      onPointerLeave={magnetic ? mag.onPointerLeave : undefined}
      onPointerDown={(e) => {
        triggerRipple(e);
        onPointerDown?.(e);
      }}
      style={{
        ...style,
        transform:
          magnetic && (mag.offset.x !== 0 || mag.offset.y !== 0)
            ? `translate3d(${mag.offset.x}px, ${mag.offset.y}px, 0)`
            : style?.transform,
      }}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden transition-transform duration-150 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white/35 animate-ping"
          style={{
            left: r.x - 16,
            top: r.y - 16,
            width: 32,
            height: 32,
          }}
        />
      ))}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
