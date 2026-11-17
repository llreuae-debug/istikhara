import type { PlatformPreset } from "@/config/platforms";

interface SafeZoneOverlayProps {
  preset: PlatformPreset;
  visible: boolean;
}

export function SafeZoneOverlay({ preset, visible }: SafeZoneOverlayProps) {
  if (!visible) return null;

  const topPct = (preset.safeZone.top / preset.height) * 100;
  const bottomPct = (preset.safeZone.bottom / preset.height) * 100;
  const leftPct = (preset.safeZone.left / preset.width) * 100;
  const rightPct = (preset.safeZone.right / preset.width) * 100;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
      aria-hidden="true"
    >
      {/* Safe zone outline */}
      <div
        className="absolute border-2 border-dashed border-[#E6CF7A]/80 bg-transparent"
        style={{
          top: `${topPct}%`,
          bottom: `${bottomPct}%`,
          left: `${leftPct}%`,
          right: `${rightPct}%`,
        }}
      />

      {/* Top/Bottom unsafe dim strips */}
      <div
        className="absolute inset-x-0 top-0 bg-red-500/15"
        style={{ height: `${topPct}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-red-500/15"
        style={{ height: `${bottomPct}%` }}
      />

      {/* Ghost UI per platform */}
      {preset.ghostUiType === "vertical_social" && (
        <div
          className="absolute right-2 flex flex-col items-center gap-3 opacity-55"
          style={{ bottom: `${bottomPct + 4}%` }}
        >
          <span className="w-6 h-6 rounded-full bg-white/40" />
          <span className="w-6 h-6 rounded-full bg-white/40" />
          <span className="w-6 h-6 rounded-full bg-white/40" />
        </div>
      )}

      {preset.ghostUiType === "whatsapp" && (
        <div className="absolute inset-x-6 bottom-4 h-7 rounded-full bg-white/25 opacity-60" />
      )}
    </div>
  );
}
