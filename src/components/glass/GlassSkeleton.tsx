export function GlassSkeleton({ className = "h-12 w-full" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl glass-1 glass-border-mask mushaf-shimmer ${className}`}
    />
  );
}
