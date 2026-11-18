export interface GlassSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  ariaLabel?: string;
  className?: string;
}

export function GlassSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel = "Slider",
  className = "",
}: GlassSliderProps) {
  const pct = ((value - min) / Math.max(0.0001, max - min)) * 100;

  return (
    <div className={`relative flex items-center h-8 ${className}`}>
      <div className="w-full h-2 rounded-full glass-track overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#E6CF7A]"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-6 h-6 -ms-3 rounded-full glass-3 glass-lens-glints"
        style={{ insetInlineStart: `${Math.max(0, Math.min(100, pct))}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
