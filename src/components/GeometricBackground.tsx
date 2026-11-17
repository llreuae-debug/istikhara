import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useApp } from "@/lib/i18n";

interface GeometricBackgroundProps {
  brighten?: boolean;
  dimmed?: boolean;
}

export function GeometricBackground({
  brighten = false,
  dimmed = false,
}: GeometricBackgroundProps) {
  const prefersReduced = useReducedMotion();
  const { settings, resolvedTheme } = useApp();
  const layerRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  const animate = settings.animations && !prefersReduced;

  useEffect(() => {
    if (!animate) return;

    let rafId = 0;
    let startTime = performance.now();
    let scrollY = window.scrollY || 0;
    let tiltX = 0;
    let tiltY = 0;
    let paused = document.hidden;

    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        tiltX = Math.max(-12, Math.min(12, e.gamma * 0.25));
        tiltY = Math.max(-12, Math.min(12, (e.beta - 35) * 0.2));
      }
    };

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused && !rafId) {
        startTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      if (paused) {
        rafId = 0;
        return;
      }

      const elapsedSec = (now - startTime) / 1000;
      const deg = (elapsedSec * (360 / 240)) % 360;
      const py = -(scrollY * 0.04) + tiltY;

      if (layerRef.current) {
        layerRef.current.style.transform = `translate3d(${tiltX.toFixed(1)}px, ${py.toFixed(1)}px, 0) rotate(${deg.toFixed(3)}deg)`;
      }

      if (sweepRef.current) {
        const sweepPhase = (elapsedSec % 14) / 14;
        const sweepX = -40 + sweepPhase * 180;
        sweepRef.current.style.transform = `translate3d(${sweepX.toFixed(1)}%, 0, 0) rotate(25deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    if (!paused) {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("deviceorientation", onOrientation);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [animate]);

  const bgGradient =
    resolvedTheme === "dark"
      ? dimmed
        ? "radial-gradient(circle at 50% 35%, rgba(11, 61, 46, 0.45) 0%, #06101E 75%)"
        : "radial-gradient(circle at 50% 30%, #0B3D2E 0%, #0A1A2F 72%)"
      : "radial-gradient(circle at 50% 30%, #FFFFFF 0%, #F7F1E3 75%)";

  const patternOpacity = dimmed
    ? 0.04
    : brighten
    ? 0.11
    : resolvedTheme === "dark"
    ? 0.08
    : 0.09;

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: bgGradient }}
      aria-hidden="true"
    >
      {/* 8-fold Islamic geometric girih/rosette tessellation */}
      <div
        ref={layerRef}
        className="absolute -inset-[25%] will-change-transform"
        style={{ opacity: patternOpacity }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="girih-rosette"
              width="140"
              height="140"
              patternUnits="userSpaceOnUse"
            >
              <g fill="none" stroke="#C9A227" strokeWidth="1">
                <rect x="28" y="28" width="84" height="84" />
                <rect
                  x="28"
                  y="28"
                  width="84"
                  height="84"
                  transform="rotate(45 70 70)"
                />
                <circle cx="70" cy="70" r="24" strokeOpacity="0.65" />
                <path d="M70 0 L70 28 M70 112 L70 140 M0 70 L28 70 M112 70 L140 70" />
                <path d="M0 0 L28 28 M140 0 L112 28 M0 140 L28 112 M140 140 L112 112" strokeOpacity="0.6" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#girih-rosette)" />
        </svg>
      </div>

      {/* Occasional soft gold light sweep */}
      {animate && (
        <div
          ref={sweepRef}
          className="absolute inset-y-0 left-0 w-1/2 pointer-events-none will-change-transform"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(230, 207, 122, 0.06) 50%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
