import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "./useLowPower";

function canHoverDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(hover: hover)").matches ?? false;
}

/**
 * Tracks pointer position with rAF and updates --mx / --my CSS variables
 * on the target element for smooth cursor-reactive specular highlights.
 */
export function useGlassPointerLight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const rafRef = useRef<number>(0);
  const reduced = useReducedMotionPref();

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (reduced || !canHoverDevice() || !ref.current) return;
      const el = ref.current;
      const clientX = e.clientX;
      const clientY = e.clientY;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const y = ((clientY - rect.top) / Math.max(1, rect.height)) * 100;
        el.style.setProperty("--mx", `${x.toFixed(1)}%`);
        el.style.setProperty("--my", `${y.toFixed(1)}%`);
      });
    },
    [reduced]
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  return { ref, onPointerMove };
}

/**
 * Subtle up to 4deg 3D tilt toward pointer on hover-capable desktop devices.
 */
export function useCardTilt(maxDeg = 4, enabled = true) {
  const reduced = useReducedMotionPref();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled || reduced || !canHoverDevice()) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      setTilt({
        rx: Number((-ny * maxDeg * 2).toFixed(2)),
        ry: Number((nx * maxDeg * 2).toFixed(2)),
      });
    },
    [enabled, maxDeg, reduced]
  );

  const onPointerLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
  }, []);

  return { tilt, onPointerMove, onPointerLeave };
}

/**
 * Magnetic CTA offset (up to 4px toward cursor) on hover-capable devices.
 */
export function useMagneticCta(maxPx = 4) {
  const reduced = useReducedMotionPref();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduced || !canHoverDevice()) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
      setOffset({
        x: Math.max(-maxPx, Math.min(maxPx, nx * maxPx)),
        y: Math.max(-maxPx, Math.min(maxPx, ny * maxPx)),
      });
    },
    [maxPx, reduced]
  );

  const onPointerLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);
  return { offset, onPointerMove, onPointerLeave };
}

export interface GlassRipple {
  id: number;
  x: number;
  y: number;
}

export function usePressRipple() {
  const reduced = useReducedMotionPref();
  const [ripples, setRipples] = useState<GlassRipple[]>([]);

  const triggerRipple = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now() + Math.random();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRipples((prev) => [...prev.slice(-2), { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 260);
    },
    [reduced]
  );

  return { ripples, triggerRipple };
}
