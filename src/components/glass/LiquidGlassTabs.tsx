import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import { useLowPowerMode, useReducedMotionPref } from "@/lib/glass/useLowPower";

export interface LiquidTabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabRect {
  left: number;
  width: number;
}

/**
 * Pure helper: computes velocity-based squeeze scaleX / scaleY during lens travel.
 */
export function computeSqueezeScale(velocityPxPerSec: number): {
  scaleX: number;
  scaleY: number;
} {
  const speed = Math.abs(velocityPxPerSec);
  const k = 0.00018;
  return {
    scaleX: 1 + Math.min(speed * k, 0.28),
    scaleY: 1 - Math.min(speed * (k * 0.5), 0.14),
  };
}

/**
 * Pure helper: picks nearest tab index from lens center + velocity projection.
 */
export function projectNearestTabIndex(
  lensCenterX: number,
  tabRects: TabRect[],
  velocityX = 0
): number {
  if (tabRects.length === 0) return 0;
  const projectedCenter = lensCenterX + velocityX * 0.09;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < tabRects.length; i++) {
    const c = tabRects[i].left + tabRects[i].width / 2;
    const d = Math.abs(projectedCenter - c);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Pure helper: keyboard arrow navigation mirrored in RTL.
 */
export function nextTabIndexForKey(
  key: string,
  currentIndex: number,
  count: number,
  isRtl: boolean
): number | null {
  if (count <= 0) return null;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowRight") {
    return isRtl
      ? (currentIndex - 1 + count) % count
      : (currentIndex + 1) % count;
  }
  if (key === "ArrowLeft") {
    return isRtl
      ? (currentIndex + 1) % count
      : (currentIndex - 1 + count) % count;
  }
  return null;
}

function isChromiumEngine(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Chrome|Chromium|Edg\//.test(ua) && !/Firefox/.test(ua);
}

export interface LiquidGlassTabsProps {
  items: LiquidTabItem[];
  value: string;
  onChange: (id: string) => void;
  isRtl?: boolean;
  compact?: boolean;
  ariaLabel?: string;
  helperText?: string;
  className?: string;
}

export function LiquidGlassTabs({
  items,
  value,
  onChange,
  isRtl = false,
  compact = false,
  ariaLabel = "Navigation tabs",
  helperText,
  className = "",
}: LiquidGlassTabsProps) {
  const reducedMotion = useReducedMotionPref();
  const lowPower = useLowPowerMode();
  const useSvgRefraction = !lowPower && !reducedMotion && isChromiumEngine();

  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeLayerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  const [rects, setRects] = useState<TabRect[]>([]);
  const [trackWidth, setTrackWidth] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeIndex = Math.max(
    0,
    items.findIndex((t) => t.id === value)
  );

  // Motion values for smooth 60fps lens travel, squeeze & wobble
  const lensX = useMotionValue(0);
  const lensW = useMotionValue(80);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const specularShiftX = useMotionValue(0);

  const dragState = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startLensX: number;
    lastX: number;
    lastTime: number;
    velocityX: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startLensX: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    moved: false,
  });

  const measureTabs = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const tRect = track.getBoundingClientRect();
    setTrackWidth(tRect.width);
    const nextRects: TabRect[] = items.map((_, i) => {
      const el = tabRefs.current[i];
      if (!el) return { left: 0, width: 64 };
      const r = el.getBoundingClientRect();
      return {
        left: r.left - tRect.left,
        width: r.width,
      };
    });
    setRects(nextRects);
  }, [items]);

  useLayoutEffect(() => {
    measureTabs();
    document.fonts?.ready.then(measureTabs).catch(() => {});
    window.addEventListener("resize", measureTabs);
    if (typeof ResizeObserver === "undefined" || !trackRef.current) {
      return () => window.removeEventListener("resize", measureTabs);
    }
    const ro = new ResizeObserver(measureTabs);
    ro.observe(trackRef.current);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureTabs);
    };
  }, [measureTabs, isRtl]);

  // Sync clipped active label layer + glint speed every frame
  const syncClip = useCallback(
    (x: number, w: number, vel = 0) => {
      const layer = activeLayerRef.current;
      if (layer && trackWidth > 0) {
        const leftClip = Math.max(0, x);
        const rightClip = Math.max(0, trackWidth - (x + w));
        layer.style.clipPath = `inset(0px ${rightClip.toFixed(1)}px 0px ${leftClip.toFixed(1)}px round 999px)`;
      }
      const lens = lensRef.current;
      if (lens && !reducedMotion && !lowPower) {
        const speedRatio = Math.min(4, 1 + Math.abs(vel) / 450);
        lens.style.setProperty("--glint-duration", `${(8 / speedRatio).toFixed(2)}s`);
        lens.style.setProperty(
          "--glint-opacity",
          String(Math.min(1, 0.62 + Math.abs(vel) / 1400))
        );
      }
    },
    [trackWidth, reducedMotion, lowPower]
  );

  // Move lens to activeIndex with squeeze -> land -> wobble
  useEffect(() => {
    const target = rects[activeIndex];
    if (!target || isDragging) return;

    if (reducedMotion) {
      animate(lensX, target.left, {
        duration: 0.15,
        ease: "easeOut",
        onUpdate: (v) => syncClip(v, lensW.get(), 0),
      });
      animate(lensW, target.width, { duration: 0.15, ease: "easeOut" });
      scaleX.set(1);
      scaleY.set(1);
      return;
    }

    const prevX = lensX.get();
    const dist = target.left - prevX;
    let wobbleStarted = false;

    const xCtrl = animate(lensX, target.left, {
      type: "spring",
      stiffness: 420,
      damping: 30,
      mass: 0.9,
      onUpdate: (v) => {
        const vel = lensX.getVelocity();
        syncClip(v, lensW.get(), vel);
        const sq = computeSqueezeScale(vel);
        if (!wobbleStarted) {
          scaleX.set(sq.scaleX);
          scaleY.set(sq.scaleY);
          specularShiftX.set(Math.max(-10, Math.min(10, -vel * 0.012)));
        }
        if (Math.abs(target.left - v) < 6 && Math.abs(dist) > 8 && !wobbleStarted) {
          wobbleStarted = true;
          // Decaying landing wobble (~420ms)
          animate(scaleX, [1.04, 0.97, 1.015, 1], { duration: 0.42, ease: "easeOut" });
          animate(scaleY, [0.96, 1.03, 0.99, 1], { duration: 0.42, ease: "easeOut" });
          animate(specularShiftX, 0, { duration: 0.3 });
        }
      },
      onComplete: () => {
        syncClip(target.left, target.width, 0);
        if (!wobbleStarted) {
          scaleX.set(1);
          scaleY.set(1);
        }
      },
    });

    const wCtrl = animate(lensW, target.width, {
      type: "spring",
      stiffness: 420,
      damping: 30,
      mass: 0.9,
      onUpdate: (w) => syncClip(lensX.get(), w, lensX.getVelocity()),
    });

    return () => {
      xCtrl.stop();
      wCtrl.stop();
    };
  }, [activeIndex, rects, isDragging, reducedMotion, lensX, lensW, scaleX, scaleY, specularShiftX, syncClip]);

  // Initial snap on mount or items/RTL change
  useLayoutEffect(() => {
    const target = rects[activeIndex];
    if (!target) return;
    lensX.set(target.left);
    lensW.set(target.width);
    syncClip(target.left, target.width, 0);
  }, [rects, activeIndex, lensX, lensW, syncClip]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rects.length === 0) return;
    const curX = lensX.get();
    const curW = lensW.get();
    const trackLeft = trackRef.current?.getBoundingClientRect().left ?? 0;
    const pointerInTrack = e.clientX - trackLeft;

    // Start dragging if pointer is near/on the lens
    if (pointerInTrack >= curX - 12 && pointerInTrack <= curX + curW + 12) {
      dragState.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startLensX: curX,
        lastX: e.clientX,
        lastTime: performance.now(),
        velocityX: 0,
        moved: false,
      };
      setIsDragging(true);
      if (!reducedMotion) {
        animate(scaleX, 1.03, { duration: 0.12 });
        animate(scaleY, 1.03, { duration: 0.12 });
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds.active) return;
    const dx = e.clientX - ds.startX;
    if (Math.abs(dx) > 4) ds.moved = true;

    const now = performance.now();
    const dt = Math.max(8, now - ds.lastTime);
    ds.velocityX = ((e.clientX - ds.lastX) / dt) * 1000;
    ds.lastX = e.clientX;
    ds.lastTime = now;

    const w = lensW.get();
    const maxPos = Math.max(0, trackWidth - w);
    let nextX = ds.startLensX + dx;
    // Rubber-band resistance past track ends
    if (nextX < 0) nextX = nextX * 0.28;
    else if (nextX > maxPos) nextX = maxPos + (nextX - maxPos) * 0.28;

    lensX.set(nextX);
    if (!reducedMotion) {
      const sq = computeSqueezeScale(ds.velocityX * 0.6);
      scaleX.set(sq.scaleX * 1.02);
      scaleY.set(sq.scaleY * 1.02);
    }
    syncClip(nextX, w, ds.velocityX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds.active) return;
    ds.active = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(ds.pointerId);
    } catch {
      // ignore
    }

    if (ds.moved && rects.length > 0) {
      const center = lensX.get() + lensW.get() / 2;
      const nearest = projectNearestTabIndex(center, rects, ds.velocityX);
      const picked = items[nearest];
      if (picked && picked.id !== value) {
        onChange(picked.id);
      } else {
        // Snap back to active tab
        const target = rects[activeIndex];
        if (target) {
          animate(lensX, target.left, {
            type: "spring",
            stiffness: 420,
            damping: 30,
            onUpdate: (v) => syncClip(v, target.width, 0),
          });
          animate(scaleX, [1.03, 0.98, 1], { duration: 0.3 });
          animate(scaleY, [0.97, 1.02, 1], { duration: 0.3 });
        }
      }
    } else if (!reducedMotion) {
      animate(scaleX, 1, { duration: 0.14 });
      animate(scaleY, 1, { duration: 0.14 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const nextIdx = nextTabIndexForKey(e.key, idx, items.length, isRtl);
    if (nextIdx !== null) {
      e.preventDefault();
      const target = items[nextIdx];
      if (target) {
        onChange(target.id);
        tabRefs.current[nextIdx]?.focus();
      }
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(items[idx].id);
    }
  };

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 max-w-full ${className}`}>
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        dir={isRtl ? "rtl" : "ltr"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative inline-flex items-center rounded-full glass-track glass-border-mask select-none touch-pan-y ${
          compact ? "p-1 gap-0.5" : "p-1.5 gap-1"
        }`}
      >
        {/* Hover puddle (desktop hover-capable only) */}
        {hoveredIdx !== null && rects[hoveredIdx] && hoveredIdx !== activeIndex && (
          <div
            aria-hidden="true"
            className="hidden [@media(hover:hover)]:block absolute top-1 bottom-1 rounded-full pointer-events-none transition-all duration-150"
            style={{
              left: rects[hoveredIdx].left,
              width: rects[hoveredIdx].width,
              background: "var(--glass-puddle-bg)",
              opacity: 0.6,
            }}
          />
        )}

        {/* Base muted tab buttons */}
        {items.map((item, idx) => {
          const isSelected = item.id === value;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                if (!dragState.current.moved) onChange(item.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`relative z-10 inline-flex items-center justify-center gap-1 rounded-full font-medium cursor-pointer whitespace-nowrap transition-opacity focus-visible:outline-2 focus-visible:outline-[#C9A227] ${
                compact
                  ? "px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs min-h-[34px]"
                  : "px-3.5 sm:px-4 py-2 text-xs sm:text-sm min-h-[38px]"
              }`}
              style={{
                color: "var(--glass-tab-muted)",
                opacity: hoveredIdx === idx ? 0.92 : 1,
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Raised Liquid Glass Lens */}
        <motion.div
          ref={lensRef}
          aria-hidden="true"
          className={`pointer-events-none absolute -top-[3px] -bottom-[3px] rounded-full glass-3 glass-lens-glints overflow-hidden z-20 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            left: 0,
            x: lensX,
            width: lensW,
            scaleX,
            scaleY,
            backdropFilter: useSvgRefraction
              ? "url(#istikhara-lens) blur(2px) saturate(165%)"
              : "blur(6px) saturate(165%)",
            WebkitBackdropFilter: "blur(6px) saturate(165%)",
          }}
        >
          {/* Specular ellipse in upper-left that shifts subtly against travel */}
          <motion.div
            className="absolute top-1 left-3 right-3 h-2.5 rounded-full pointer-events-none"
            style={{
              x: specularShiftX,
              background:
                "radial-gradient(ellipse at 35% 40%, rgba(255,255,255,0.52), rgba(255,255,255,0) 75%)",
            }}
          />
          {/* Radial edge darkening for Safari/Firefox/fallback thick-lens feel */}
          {!useSvgRefraction && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.16)",
              }}
            />
          )}
        </motion.div>

        {/* Active sharpened/darker label layer clipped strictly to the moving lens */}
        <div
          ref={activeLayerRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-30 flex items-center ${
            compact ? "p-1 gap-0.5" : "p-1.5 gap-1"
          }`}
        >
          {items.map((item) => (
            <span
              key={item.id}
              className={`inline-flex items-center justify-center gap-1 rounded-full font-medium whitespace-nowrap ${
                compact
                  ? "px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs min-h-[34px]"
                  : "px-3.5 sm:px-4 py-2 text-xs sm:text-sm min-h-[38px]"
              }`}
              style={{ color: "var(--glass-tab-active)" }}
            >
              {item.icon}
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-[var(--text-muted)] text-center">
          {helperText}
        </p>
      )}
    </div>
  );
}
