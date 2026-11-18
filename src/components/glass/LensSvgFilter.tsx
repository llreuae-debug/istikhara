/**
 * Pre-computed radial displacement map (no feTurbulence) for Chromium lens edge refraction.
 * Zero displacement in the center, gentle inward refraction near the capsule rim.
 */
const RADIAL_DISPLACEMENT_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='64' viewBox='0 0 128 64'>
    <defs>
      <radialGradient id='r' cx='50%' cy='50%' r='50%'>
        <stop offset='0%' stop-color='rgb(128,128,128)'/>
        <stop offset='68%' stop-color='rgb(128,128,128)'/>
        <stop offset='88%' stop-color='rgb(162,148,128)'/>
        <stop offset='100%' stop-color='rgb(92,108,128)'/>
      </radialGradient>
    </defs>
    <rect width='128' height='64' rx='32' fill='url(%23r)'/>
  </svg>`
);

export function LensSvgFilter() {
  return (
    <svg
      aria-hidden="true"
      className="fixed w-0 h-0 pointer-events-none overflow-hidden"
      width="0"
      height="0"
    >
      <defs>
        <filter id="istikhara-lens" x="-10%" y="-10%" width="120%" height="120%">
          <feImage
            href={`data:image/svg+xml,${RADIAL_DISPLACEMENT_SVG}`}
            result="dispMap"
            preserveAspectRatio="none"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="dispMap"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
