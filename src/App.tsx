import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { AppProvider, useApp } from "@/lib/i18n";
import { initAnalytics } from "@/lib/analytics";
import { isNative } from "@/lib/platform";
import { adService } from "@/lib/ads/adService";
import { PwaInstallBanner } from "@/components/AppShell";
import { GlassDock, LensSvgFilter } from "@/components/glass";
import { ARTICLES } from "@/content/articles";
import Home from "@/pages/Home";
import Guide from "@/pages/Guide";
import VerseDetail from "@/pages/VerseDetail";
import Studio from "@/pages/Studio";
import NotFound from "@/pages/NotFound";

const Prepare = lazy(() => import("@/pages/Prepare"));
const Focus = lazy(() => import("@/pages/Focus"));
const Result = lazy(() => import("@/pages/Result"));
const AyahLink = lazy(() => import("@/pages/AyahLink"));
const History = lazy(() => import("@/pages/History"));
const Daily = lazy(() => import("@/pages/Daily"));
const Settings = lazy(() => import("@/pages/Settings"));
const About = lazy(() => import("@/pages/About"));
const DuaPage = lazy(() => import("@/pages/DuaPage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));
const VersesIndex = lazy(() => import("@/pages/VersesIndex"));
const ArticlePage = lazy(() => import("@/pages/ArticlePage"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Contact = lazy(() => import("@/pages/Contact"));
const UiKit = lazy(() => import("@/pages/UiKit"));

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
      <Suspense
        fallback={
          <div className="min-h-dvh flex items-center justify-center bg-[var(--bg-primary)] text-sm text-[var(--accent-gold)]">
            …
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prepare" element={<Prepare />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/result" element={<Result />} />
          <Route path="/ayah/:surah/:ayah" element={<AyahLink />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/studio" element={<Studio />} />
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
          <Route path="/dev/ui-kit" element={<UiKit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LangGuard>
  );
}

function NativeBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNative()) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#0A1A2F" }).catch(() => {});
    SplashScreen.hide().catch(() => {});
    adService.initNativeAds();

    let openedViaLink = false;

    const backSub = CapApp.addListener("backButton", ({ canGoBack }) => {
      const openDialog = document.querySelector('[role="dialog"] button[aria-label="Close"], [role="dialog"] button[aria-label="بند کریں"]');
      if (openDialog instanceof HTMLElement) {
        openDialog.click();
        return;
      }
      const isHome =
        location.pathname === "/ur/" ||
        location.pathname === "/en/" ||
        location.pathname === "/ur" ||
        location.pathname === "/en";
      if (!isHome && canGoBack) {
        navigate(-1);
        return;
      }
      if (window.confirm("ایپ بند کریں؟ / Exit Istikhara?")) {
        CapApp.exitApp();
      }
    });

    const stateSub = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) {
        adService.markBackgrounded();
      } else {
        adService.maybeShowAppOpenOnResume(openedViaLink);
        openedViaLink = false;
      }
    });

    const urlSub = CapApp.addListener("appUrlOpen", ({ url }) => {
      try {
        const parsed = new URL(url);
        if (parsed.pathname) {
          openedViaLink = true;
          navigate(`${parsed.pathname}${parsed.search}`);
        }
      } catch {
        // ignore invalid deep link
      }
    });

    return () => {
      backSub.then((h) => h.remove());
      stateSub.then((h) => h.remove());
      urlSub.then((h) => h.remove());
    };
  }, [location.pathname, navigate]);

  return null;
}

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <AppProvider>
      <LensSvgFilter />
      <BrowserRouter>
        <NativeBridge />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/dev/ui-kit" element={<Suspense fallback={null}><UiKit /></Suspense>} />
          <Route path="/:lang/*" element={<LocalizedRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlassDock />
        <PwaInstallBanner />
      </BrowserRouter>
    </AppProvider>
  );
}
