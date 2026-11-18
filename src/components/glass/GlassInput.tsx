import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function GlassInput({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-2xl glass-1 glass-border-mask px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/60 transition-shadow ${className}`}
      {...rest}
    />
  );
}

export function GlassTextarea({
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-2xl glass-1 glass-border-mask px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/60 transition-shadow ${className}`}
      {...rest}
    />
  );
}
