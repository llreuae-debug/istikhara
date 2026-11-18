import type { ReactNode } from "react";

export interface GlassTooltipProps {
  content: string;
  children: ReactNode;
}

export function GlassTooltip({ content, children }: GlassTooltipProps) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-full glass-2 glass-border-mask text-[11px] text-[var(--text-primary)] whitespace-nowrap z-40"
      >
        {content}
      </span>
    </span>
  );
}
