import { Capacitor } from "@capacitor/core";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === "android";
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}

export type ClientOs = "android" | "ios" | "desktop";

export function detectClientOs(): ClientOs {
  if (isAndroid()) return "android";
  if (isIOS()) return "ios";
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  return "desktop";
}
