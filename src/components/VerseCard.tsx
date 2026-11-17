import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bookmark,
  BookOpen,
  Check,
  Copy,
  Download,
  Film,
  Pause,
  Play,
  RefreshCw,
  Share2,
} from "lucide-react";
import { useApp } from "@/lib/i18n";
import { getAudioCdnUrl, getAudioProxyUrl, type FetchedAyah } from "@/lib/quran";
import type { ReciterEdition } from "@/lib/storage";
import { downloadVersePdf } from "@/lib/pdf";
import { trackEvent } from "@/lib/analytics";
import { PdfTemplate } from "./PdfTemplate";
import { ShareSheet } from "./ShareSheet";

interface VerseCardProps {
  ayah: FetchedAyah;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onNewIstikhara?: () => void;
  categoryLabel?: string;
  privateNote?: string;
  ctaSlot?: React.ReactNode;
}

export function VerseCard({
  ayah,
  isSaved = false,
  onToggleSave,
  onNewIstikhara,
  categoryLabel,
  privateNote,
  ctaSlot,
}: VerseCardProps) {
  const { settings, updateSettings, t, uiLang, appUrl } = useApp();
  const prefersReduced = useReducedMotion();
  const animate = settings.animations && !prefersReduced;

  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [includeNoteInPdf, setIncludeNoteInPdf] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pdfNodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [ayah.globalNumber, settings.reciter]);

  const handleToggleAudio = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    setAudioLoading(true);
    try {
      const url = getAudioCdnUrl(ayah.globalNumber, settings.reciter);
      if (!audioRef.current || audioRef.current.src !== url) {
        audioRef.current?.pause();
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setPlaying(false);
      }
      try {
        await audioRef.current.play();
      } catch {
        const proxyUrl = getAudioProxyUrl(ayah.globalNumber, settings.reciter);
        audioRef.current = new Audio(proxyUrl);
        audioRef.current.onended = () => setPlaying(false);
        await audioRef.current.play();
      }
      setPlaying(true);
    } catch {
      setPlaying(false);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfNodeRef.current) return;
    setPdfBusy(true);
    try {
      await downloadVersePdf(pdfNodeRef.current, ayah);
      trackEvent({ name: "pdf_downloaded" });
    } finally {
      setPdfBusy(false);
    }
  };

  const handleCopyVerse = async () => {
    const text = `${ayah.arabicText} ﴿${ayah.ayahNumber}﴾\n${ayah.urduText}\n${ayah.englishText}\n— ${ayah.surahNameEn} ${ayah.surahNumber}:${ayah.ayahNumber}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(true);
      window.setTimeout(() => setCopiedVerse(false), 1800);
    } catch {
      // ignore
    }
  };

  const showUrdu = settings.language === "ur" || settings.language === "both";
  const showEnglish = settings.language === "en" || settings.language === "both";

  return (
    <>
      <motion.article
        initial={
          animate
            ? {
                opacity: 0,
                scale: 0.96,
                clipPath: "inset(8% 4% 12% 4% round 16px)",
              }
            : false
        }
        animate={{
          opacity: 1,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0% round 16px)",
        }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-3xl mx-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] backdrop-blur-md p-5 sm:p-8 md:p-10 shadow-2xl space-y-6"
      >
        {/* Inner ornamental hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2.5 rounded-xl border border-[var(--gold)]/20"
        />

        {/* Reference header */}
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--accent-gold)] font-medium">
            <span className="font-arabic-quran text-base">{ayah.surahNameAr}</span>
            <span aria-hidden="true">•</span>
            <span>{ayah.surahNameEn}</span>
            <span aria-hidden="true">•</span>
            <span dir="ltr">
              {ayah.surahNumber}:{ayah.ayahNumber}
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            {t.result.juz} {ayah.juz}
          </span>
        </header>

        {/* Arabic Quran text with optional Basmala header & ayah-end marker */}
        <div className="relative z-10 py-2 text-center space-y-3">
          {ayah.basmalaHeader && (
            <p
              className="font-arabic-quran text-lg sm:text-xl text-[var(--accent-gold)]"
              dir="rtl"
            >
              {ayah.basmalaHeader}
            </p>
          )}
          <p
            className="font-arabic-quran text-[var(--text-primary)]"
            style={{ fontSize: `${settings.arabicFontSize}px` }}
            dir="rtl"
          >
            {ayah.arabicText}{" "}
            <span className="text-[var(--accent-gold)] inline-block">
              ﴿{ayah.ayahNumber}﴾
            </span>
          </p>
        </div>

        {/* Translations */}
        <div className="relative z-10 space-y-5 border-t border-[var(--border-subtle)] pt-5">
          {showUrdu && (
            <p
              className="font-urdu-nastaliq text-base sm:text-lg text-[var(--text-primary)]/95 text-center"
              dir="rtl"
            >
              {ayah.urduText}
            </p>
          )}
          {showEnglish && (
            <p
              className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] text-center max-w-2xl mx-auto"
              dir="ltr"
            >
              {ayah.englishText}
            </p>
          )}
        </div>

        {/* Audio & Reciter row */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleToggleAudio}
            disabled={audioLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--emerald)] text-[#F7F1E3] border border-[var(--border-gold)] text-sm font-medium hover:bg-[var(--emerald-light)] transition-colors"
          >
            {playing ? (
              <Pause className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4" aria-hidden="true" />
            )}
            {playing ? t.result.pauseAudio : t.result.playAudio}
          </button>

          <label className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="sr-only">{t.result.reciter}</span>
            <select
              value={settings.reciter}
              onChange={(e) =>
                updateSettings({ reciter: e.target.value as ReciterEdition })
              }
              aria-label={t.result.reciter}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)]"
            >
              <option value="ar.alafasy">Mishary Alafasy</option>
              <option value="ar.abdulbasitmurattal">Abdul Basit (Murattal)</option>
              <option value="ar.husary">Mahmoud Al-Husary</option>
            </select>
          </label>
        </div>

        {/* Action buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <a
            href={`https://quran.com/${ayah.surahNumber}/${ayah.ayahNumber}/tafsirs`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
            {t.result.tafsir}
          </a>

          <button
            type="button"
            onClick={handleCopyVerse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            {copiedVerse ? (
              <Check className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
            )}
            {uiLang === "ur" ? "کاپی" : "Copy"}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfBusy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Download className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
            {t.result.downloadPdf}
          </button>

          <Link
            to={`/${uiLang}/studio?s=${ayah.surahNumber}&a=${ayah.ayahNumber}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Film className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
            {uiLang === "ur" ? "ویڈیو بنائیں" : "Create Video"}
          </Link>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-gold)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Share2 className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
            {t.result.share}
          </button>

          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm transition-colors ${
                isSaved
                  ? "border-[var(--gold)] bg-[var(--gold)]/20 text-[var(--accent-gold)]"
                  : "border-[var(--border-gold)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              {isSaved ? t.result.saved : t.result.save}
            </button>
          )}
        </div>

        {/* Optional include private note in PDF */}
        {privateNote?.trim() && (
          <div className="relative z-10 flex justify-center">
            <label className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeNoteInPdf}
                onChange={(e) => setIncludeNoteInPdf(e.target.checked)}
                className="rounded border-[var(--border-gold)]"
              />
              {t.result.includeNoteInPdf}
            </label>
          </div>
        )}

        {/* New Istikhara or Deep-Link CTA */}
        {(onNewIstikhara || ctaSlot) && (
          <div className="relative z-10 flex flex-col items-center gap-2 pt-2">
            {onNewIstikhara && (
              <>
                <button
                  type="button"
                  onClick={onNewIstikhara}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {t.result.newIstikhara}
                </button>
                <p className="text-xs text-[var(--text-muted)] text-center max-w-md">
                  {t.result.repeatReminder}
                </p>
              </>
            )}
            {ctaSlot}
          </div>
        )}

        {/* Mandatory gentle religious reminder */}
        <footer className="relative z-10 border-t border-[var(--border-subtle)] pt-4 text-center">
          <p
            className={`text-xs text-[var(--text-muted)] ${
              uiLang === "ur" ? "font-urdu-nastaliq" : "leading-relaxed"
            }`}
          >
            {t.religiousNote}
          </p>
        </footer>
      </motion.article>

      <PdfTemplate
        ref={pdfNodeRef}
        ayah={ayah}
        categoryLabel={categoryLabel}
        privateNote={privateNote}
        includeNote={includeNoteInPdf}
        appUrl={appUrl}
      />

      <ShareSheet
        ayah={ayah}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
