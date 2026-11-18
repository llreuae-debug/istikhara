import { useState } from "react";
import { Check, Copy, Download, Share2, X } from "lucide-react";
import { useApp } from "@/lib/i18n";
import type { FetchedAyah } from "@/lib/quran";
import { generateShareImageBlob, type ShareImageFormat } from "@/lib/shareImage";
import { saveAndShareBlob } from "@/lib/nativeFiles";
import { adService } from "@/lib/ads/adService";
import { trackEvent } from "@/lib/analytics";

interface ShareSheetProps {
  ayah: FetchedAyah;
  open: boolean;
  onClose: () => void;
}

export function ShareSheet({ ayah, open, onClose }: ShareSheetProps) {
  const { t, uiLang, appUrl } = useApp();
  const [copied, setCopied] = useState(false);
  const [busyFormat, setBusyFormat] = useState<ShareImageFormat | "native" | null>(null);

  if (!open) return null;

  const shareUrl = `${appUrl}/ayah/${ayah.surahNumber}/${ayah.ayahNumber}`;
  const translation = uiLang === "ur" ? ayah.urduText : ayah.englishText;
  const snippet = translation.slice(0, 140).trim();
  const shareText = `📖 ${ayah.surahNameEn} ${ayah.surahNumber}:${ayah.ayahNumber}\n${snippet}…\nاستخارہ — قرآنی آیات کے ذریعے الہٰی رہنمائی\nPerform yours: ${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    setBusyFormat("native");
    try {
      const blob = await generateShareImageBlob(ayah, "post", uiLang, appUrl);
      const file = new File(
        [blob],
        `Istikhara_${ayah.surahNumber}-${ayah.ayahNumber}.png`,
        { type: "image/png" }
      );
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Istikhara — استخارہ",
          text: shareText,
          url: shareUrl,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "Istikhara — استخارہ",
          text: shareText,
          url: shareUrl,
        });
      }
    } catch {
      // user cancelled or unsupported
    } finally {
      setBusyFormat(null);
    }
  };

  const handleDownloadImage = async (format: ShareImageFormat) => {
    setBusyFormat(format);
    try {
      const blob = await generateShareImageBlob(ayah, format, uiLang, appUrl);
      await saveAndShareBlob({
        blob,
        filename: `Istikhara_${ayah.surahNumber}-${ayah.ayahNumber}_${format}.png`,
        kind: "image",
        openShareSheet: false,
      });
      trackEvent({ name: "image_shared", props: { preset: format } });
      await adService.showInterstitialAfterExport();
    } finally {
      setBusyFormat(null);
    }
  };

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.share.title}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-primary)] p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display-serif text-xl font-semibold text-[var(--text-primary)]">
            {t.share.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.share.close}
            className="p-2 rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">{t.share.privacyNote}</p>

        <div className="grid grid-cols-2 gap-2.5">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={busyFormat !== null}
              className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)] transition-colors"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              {t.share.nativeShare}
            </button>
          )}

          <a
            href={`https://wa.me/?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Telegram
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            X / Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Facebook
          </a>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
            {copied ? t.share.copied : t.share.copyLink}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDownloadImage("post")}
              disabled={busyFormat !== null}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--border-gold)] text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              {t.share.downloadPost}
            </button>
            <button
              type="button"
              onClick={() => handleDownloadImage("story")}
              disabled={busyFormat !== null}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--border-gold)] text-xs sm:text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              {t.share.downloadStory}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
