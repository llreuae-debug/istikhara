import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface GlassChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

export function GlassChip({
  selected = false,
  className = "",
  children,
  ...rest
}: GlassChipProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[16px] text-xs font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer glass-border-mask ${
        selected
          ? "glass-3 glass-lens-glints bg-[var(--gold)]/25 text-[var(--accent-gold)] font-semibold"
          : "glass-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
