import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AppProvider, useApp } from "@/lib/i18n";
import { initAnalytics } from "@/lib/analytics";
import { PwaInstallBanner } from "@/components/AppShell";
import { ARTICLES } from "@/content/articles";
import Home from "@/pages/Home";
import Prepare from "@/pages/Prepare";
import Focus from "@/pages/Focus";
import Result from "@/pages/Result";
import AyahLink from "@/pages/AyahLink";
import Guide from "@/pages/Guide";
import History from "@/pages/History";
import Daily from "@/pages/Daily";
import Settings from "@/pages/Settings";
import About from "@/pages/About";
import DuaPage from "@/pages/DuaPage";
import FaqPage from "@/pages/FaqPage";
import VersesIndex from "@/pages/VersesIndex";
import VerseDetail from "@/pages/VerseDetail";
import ArticlePage from "@/pages/ArticlePage";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

const Studio = lazy(() => import("@/pages/Studio"));

function RootRedirect() {
  const { settings } = useApp();
  let target: "ur" | "en" = settings.language === "en" ? "en" : "ur";
  if (typeof navigator !== "undefined" && !localStorage.getItem("istikhara:settings:v1")) {
    target = navigator.language?.toLowerCase().startsWith("en") ? "en" : "ur";
  }
  return <Navigate to={`/${target}/`} replace />;
}

function LangGuard({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>();
  const { uiLang, updateSettings } = useApp();

  useEffect(() => {
    if ((lang === "ur" || lang === "en") && lang !== uiLang) {
      updateSettings({ language: lang });
    }
  }, [lang, uiLang]);

  if (lang !== "ur" && lang !== "en") {
    return <NotFound />;
  }
  return <>{children}</>;
}

function LocalizedRoutes() {
  return (
    <LangGuard>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prepare" element={<Prepare />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/result" element={<Result />} />
        <Route path="/ayah/:surah/:ayah" element={<AyahLink />} />
        <Route path="/daily" element={<Daily />} />
        <Route
          path="/studio"
          element={
            <Suspense
              fallback={
                <div className="min-h-dvh flex items-center justify-center text-sm text-[var(--accent-gold)]">
                  Loading Studio…
                </div>
              }
            >
              <Studio />
            </Suspense>
          }
        />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/dua" element={<DuaPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/verses" element={<VersesIndex />} />
        <Route path="/verses/:slug" element={<VerseDetail />} />
        {ARTICLES.map((a) => (
          <Route
            key={a.slug}
            path={`/${a.slug}`}
            element={<ArticlePage slug={a.slug} />}
          />
        ))}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LangGuard>
  );
}

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:lang/*" element={<LocalizedRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <PwaInstallBanner />
      </BrowserRouter>
    </AppProvider>
  );
}
