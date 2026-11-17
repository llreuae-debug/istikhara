import React, { createContext, useContext, useEffect, useState } from "react";
import urStrings from "@/content/i18n/ur.json";
import enStrings from "@/content/i18n/en.json";
import {
  loadSettings,
  saveSettings,
  type AppSettings,
  type LanguageMode,
} from "./storage";

export type UiLang = "ur" | "en";
type Strings = typeof urStrings;

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  uiLang: UiLang;
  toggleLanguage: () => void;
  t: Strings;
  isRtl: boolean;
  resolvedTheme: "dark" | "light";
  appUrl: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const uiLang: UiLang = settings.language === "en" ? "en" : "ur";
  const isRtl = uiLang === "ur";
  const resolvedTheme: "dark" | "light" =
    settings.theme === "auto"
      ? systemDark
        ? "dark"
        : "light"
      : settings.theme;

  useEffect(() => {
    document.documentElement.lang = uiLang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.dataset.theme = resolvedTheme;
  }, [uiLang, isRtl, resolvedTheme]);

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  const toggleLanguage = () => {
    const nextLang: LanguageMode = uiLang === "ur" ? "en" : "ur";
    updateSettings({ language: nextLang });
  };

  const t = uiLang === "ur" ? urStrings : enStrings;
  const appUrl =
    (import.meta.env.VITE_APP_URL as string | undefined) ||
    (typeof window !== "undefined" ? window.location.origin : "https://istikhara.app");

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        uiLang,
        toggleLanguage,
        t,
        isRtl,
        resolvedTheme,
        appUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
