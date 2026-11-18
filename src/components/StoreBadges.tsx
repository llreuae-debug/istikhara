import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import QRCode from "qrcode";
import { detectClientOs, isNative } from "@/lib/platform";
import { getAppStoreUrl, getPlayStoreUrl } from "@/config/stores";
import { useApp } from "@/lib/i18n";

export function StoreBadges({
  placement,
  showDesktopQr = false,
}: {
  placement: string;
  showDesktopQr?: boolean;
}) {
  const { uiLang } = useApp();
  const isUrdu = uiLang === "ur";
  const os = detectClientOs();
  const playUrl = getPlayStoreUrl(placement);
  const appStoreUrl = getAppStoreUrl(placement);

  const [playQr, setPlayQr] = useState("");
  const [iosQr, setIosQr] = useState("");

  useEffect(() => {
    if (!showDesktopQr || os !== "desktop") return;
    if (playUrl) {
      QRCode.toDataURL(playUrl, { width: 96, margin: 1 }).then(setPlayQr).catch(() => {});
    }
    if (appStoreUrl) {
      QRCode.toDataURL(appStoreUrl, { width: 96, margin: 1 }).then(setIosQr).catch(() => {});
    }
  }, [showDesktopQr, os, playUrl, appStoreUrl]);

  if (isNative()) return null;

  const playBadge = (
    <div key="play" className="flex flex-col items-center gap-1.5">
      {playUrl ? (
        <a
          href={playUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get it on Google Play"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black text-white border border-white/25 hover:border-[var(--gold)] transition-colors"
        >
          <span className="text-lg" aria-hidden="true">▶</span>
          <span className="text-left leading-tight" dir="ltr">
            <span className="block text-[10px] uppercase opacity-80">GET IT ON</span>
            <span className="block text-sm font-semibold">Google Play</span>
          </span>
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/40 text-white/60 border border-white/15 cursor-not-allowed"
        >
          <span className="text-lg" aria-hidden="true">▶</span>
          <span className="text-left leading-tight" dir="ltr">
            <span className="block text-[10px] uppercase">Google Play</span>
            <span className="block text-xs">
              {isUrdu ? "جلد آ رہا ہے" : "Coming soon"}
            </span>
          </span>
        </span>
      )}
      {playQr && <img src={playQr} alt="Google Play QR" className="w-20 h-20 rounded-lg" />}
    </div>
  );

  const iosBadge = (
    <div key="ios" className="flex flex-col items-center gap-1.5">
      {appStoreUrl ? (
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download on the App Store"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black text-white border border-white/25 hover:border-[var(--gold)] transition-colors"
        >
          <span className="text-lg" aria-hidden="true"></span>
          <span className="text-left leading-tight" dir="ltr">
            <span className="block text-[10px] opacity-80">Download on the</span>
            <span className="block text-sm font-semibold">App Store</span>
          </span>
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/40 text-white/60 border border-white/15 cursor-not-allowed"
        >
          <span className="text-lg" aria-hidden="true"></span>
          <span className="text-left leading-tight" dir="ltr">
            <span className="block text-[10px]">App Store</span>
            <span className="block text-xs">
              {isUrdu ? "جلد آ رہا ہے" : "Coming soon"}
            </span>
          </span>
        </span>
      )}
      {iosQr && <img src={iosQr} alt="App Store QR" className="w-20 h-20 rounded-lg" />}
    </div>
  );

  const ordered = os === "ios" ? [iosBadge, playBadge] : [playBadge, iosBadge];

  return <div className="flex flex-wrap items-center justify-center gap-3">{ordered}</div>;
}

export function GetAppModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { uiLang } = useApp();
  const isUrdu = uiLang === "ur";
  if (!open || isNative()) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isUrdu ? "ایپ ڈاؤن لوڈ کریں" : "Get the App"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-primary)] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display-serif text-xl font-semibold text-[var(--accent-gold)] flex items-center gap-2">
            <Smartphone className="w-5 h-5" aria-hidden="true" />
            {isUrdu ? "ایپ ڈاؤن لوڈ کریں" : "Get the Istikhara App"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full border border-[var(--border-subtle)]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <ul className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
          <li>{isUrdu ? "مکمل آف لائن قرآن اور تفاسیر" : "Works completely offline"}</li>
          <li>{isUrdu ? "روزانہ آج کی آیت کی یاددہانی" : "Daily Verse of the Day reminder"}</li>
          <li>{isUrdu ? "PDF اور MP4 براہِ راست گیلری میں محفوظ کریں" : "Save PDFs & MP4 videos directly to gallery"}</li>
        </ul>

        <StoreBadges placement="header_modal" showDesktopQr />
      </div>
    </div>
  );
}

export function AndroidSmartBanner() {
  const [dismissed, setDismissed] = useState(false);
  const os = detectClientOs();
  const playUrl = getPlayStoreUrl("smart_banner");
  if (isNative() || os !== "android" || !playUrl || dismissed) return null;

  return (
    <div className="bg-[var(--emerald)] text-[#F7F1E3] px-4 py-2 text-xs flex items-center justify-between gap-2 border-b border-[var(--border-gold)]">
      <span>Istikhara ایپ میں کھولیں</span>
      <div className="flex items-center gap-2">
        <a
          href={playUrl}
          className="px-2.5 py-1 rounded-lg bg-[var(--gold)] text-[#0A1A2F] font-semibold"
        >
          Open
        </a>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss">
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
