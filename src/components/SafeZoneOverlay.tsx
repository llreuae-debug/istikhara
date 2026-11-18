import {
  UNIVERSAL_SAFE_ZONE,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  type Platform916Preset,
} from "@/config/platforms916";

interface SafeZoneOverlayProps {
  platform: Platform916Preset;
  visible: boolean;
}

export function SafeZoneOverlay({ platform, visible }: SafeZoneOverlayProps) {
  if (!visible) return null;

  const uTop = (UNIVERSAL_SAFE_ZONE.top / VIDEO_HEIGHT) * 100;
  const uBottom = (UNIVERSAL_SAFE_ZONE.bottom / VIDEO_HEIGHT) * 100;
  const uLeft = (UNIVERSAL_SAFE_ZONE.left / VIDEO_WIDTH) * 100;
  const uRight = (UNIVERSAL_SAFE_ZONE.right / VIDEO_WIDTH) * 100;

  const pTop = (platform.safeZone.top / VIDEO_HEIGHT) * 100;
  const pBottom = (platform.safeZone.bottom / VIDEO_HEIGHT) * 100;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
      aria-hidden="true"
    >
      {/* Platform unsafe top & bottom strips */}
      <div
        className="absolute inset-x-0 top-0 bg-red-500/15"
        style={{ height: `${pTop}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-red-500/15"
        style={{ height: `${pBottom}%` }}
      />

      {/* Universal Safe Zone dashed frame (870x1190) */}
      <div
        className="absolute border-2 border-dashed border-[#E6CF7A]/85"
        style={{
          top: `${uTop}%`,
          bottom: `${uBottom}%`,
          left: `${uLeft}%`,
          right: `${uRight}%`,
        }}
      />

      {/* Platform-specific ghost UI */}
      {platform.id !== "universal" && platform.id !== "whatsapp_status" && (
        <>
          <div className="absolute right-2.5 bottom-[24%] flex flex-col items-center gap-2.5 opacity-60">
            <span className="w-6 h-6 rounded-full bg-white/45" />
            <span className="w-6 h-6 rounded-full bg-white/45" />
            <span className="w-6 h-6 rounded-full bg-white/45" />
          </div>
          <div className="absolute left-4 right-14 bottom-5 space-y-1.5 opacity-55">
            <div className="h-2.5 w-24 rounded-full bg-white/50" />
            <div className="h-2 w-40 rounded-full bg-white/35" />
          </div>
        </>
      )}

      {platform.id === "whatsapp_status" && (
        <div className="absolute inset-x-6 bottom-4 h-7 rounded-full bg-white/25 opacity-60" />
      )}
    </div>
  );
}
