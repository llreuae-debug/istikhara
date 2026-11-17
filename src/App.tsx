import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/lib/i18n";
import { PwaInstallBanner } from "@/components/AppShell";
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prepare" element={<Prepare />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/result" element={<Result />} />
          <Route path="/ayah/:surah/:ayah" element={<AyahLink />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/history" element={<History />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PwaInstallBanner />
      </BrowserRouter>
    </AppProvider>
  );
}
