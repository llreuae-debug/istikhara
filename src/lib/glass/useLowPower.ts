import { useEffect, useState } from "react";
import { useApp } from "@/lib/i18n";

export function useLowPowerMode(): boolean {
  const { settings } = useApp();
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
    const lowCores =
      typeof nav.hardwareConcurrency === "number" &&
      nav.hardwareConcurrency <= 4;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isLow = Boolean(lowMem || lowCores || !settings.animations || reducedMotion);
    setLowPower(isLow);

    if (typeof document !== "undefined") {
      if (isLow) document.documentElement.dataset.lowPower = "true";
      else delete document.documentElement.dataset.lowPower;
    }
  }, [settings.animations]);

  return lowPower;
}

export function useReducedMotionPref(): boolean {
  const { settings } = useApp();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches || !settings.animations);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [settings.animations]);

  return reduced;
}
