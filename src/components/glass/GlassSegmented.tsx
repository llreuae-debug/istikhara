import { LiquidGlassTabs, type LiquidTabItem } from "./LiquidGlassTabs";

export interface GlassSegmentedProps {
  items: LiquidTabItem[];
  value: string;
  onChange: (id: string) => void;
  isRtl?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function GlassSegmented({
  items,
  value,
  onChange,
  isRtl = false,
  ariaLabel = "Segmented control",
  className = "",
}: GlassSegmentedProps) {
  return (
    <LiquidGlassTabs
      items={items}
      value={value}
      onChange={onChange}
      isRtl={isRtl}
      compact
      ariaLabel={ariaLabel}
      className={className}
    />
  );
}
