import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  Copy,
  Download,
  Film,
  Pause,
  Play,
  Share2,
  ShieldAlert,
  X,
} from "lucide-react";
import { BRAND } from "@/brand";
import { PLATFORM_PRESETS, type PlatformPresetId } from "@/config/platforms";
import { RECITERS, getReciterName, type ReciterId } from "@/config/reciters";
import { useApp } from "@/lib/i18n";
import { getAyahRange, type FetchedAyah } from "@/lib/quran";
import { trackEvent } from "@/lib/analytics";
import {
  buildVerseTimeline,
  type VideoLangMode,
  type VideoStudioOptions,
  type VideoTheme,
} from "@/lib/video/timeline";
import { renderVideoFrame } from "@/lib/video/render";
import { toSrt, toVtt } from "@/lib/video/subtitles";
import {
  exportVerseMp4,
  loadQrImage,
  type EncodeProgress,
} from "@/lib/video/encode";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { SafeZoneOverlay } from "@/components/SafeZoneOverlay";
import { Head } from "@/seo/Head";

export default function Studio() {
  const { uiLang, settings } = useApp();
  const [searchParams] = useSearchParams();

  const initialSurah = Number(searchParams.get("s") || 3);
  const initialAyah = Number(searchParams.get("a") || 159);

  const [surah, setSurah] = useState(initialSurah);
  const [startAyah, setStartAyah] = useState(initialAyah);
  const [rangeCount, setRangeCount] = useState(1);
  const [ayahs, setAyahs] = useState<FetchedAyah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(true);

  const [presetId, setPresetId] = useState<PlatformPresetId>("reels");
  const [langMode, setLangMode] = useState<VideoLangMode>("ar_ur");
  const [theme, setTheme] = useState<VideoTheme>("midnight_gold");
  const [arabicFontSize, setArabicFontSize] = useState(52);
  const [reciter, setReciter] = useState<ReciterId>(settings.reciter);
  const [showReference, setShowReference] = useState(true);
  const [showQr, setShowQr] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);

  const [playingPreview, setPlayingPreview] = useState(false);
  const [previewTime, setPreviewTime] = useState(1.9);
  const [progress, setProgress] = useState<EncodeProgress | null>(null);
  const [exported, setExported] = useState<{
    mp4Url: string;
    mp4Blob: Blob;
    thumbUrl: string;
    srt: string;
    vtt: string;
    durationSec: number;
  } | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);

  const preset = useMemo(
    () => PLATFORM_PRESETS.find((p) => p.id === presetId) ?? PLATFORM_PRESETS[0],
    [presetId]
  );

  const options: VideoStudioOptions = {
    langMode,
    theme,
    arabicFontSize,
    showReference,
    showQr,
  };

  useEffect(() => {
    let active = true;
    setLoadingAyahs(true);
    getAyahRange(surah, startAyah, rangeCount)
      .then((list) => {
        if (!active) return;
        setAyahs(list);
        if (list[0]) {
          loadQrImage(list[0], uiLang).then((img) => {
            qrImgRef.current = img;
          });
        }
      })
      .finally(() => {
        if (active) setLoadingAyahs(false);
      });
    return () => {
      active = false;
    };
  }, [surah, startAyah, rangeCount, uiLang]);

  const previewTimeline = useMemo(() => {
    const estDurations = ayahs.map((a) => Math.max(4, a.arabicText.length * 0.08));
    return buildVerseTimeline(ayahs, estDurations, preset, options);
  }, [ayahs, preset, langMode, theme, arabicFontSize, showReference, showQr]);

  // Draw preview frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ayahs.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderVideoFrame(
      ctx,
      previewTime,
      previewTimeline.totalDurationSec,
      previewTimeline.pages,
      preset,
      options,
      reciter,
      qrImgRef.current
    );
  }, [previewTime, previewTimeline, preset, options, reciter, ayahs.length]);

  // Animate preview playback
  useEffect(() => {
    if (!playingPreview) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPreviewTime((prev) => {
        const next = prev + dt;
        if (next >= previewTimeline.totalDurationSec) {
          setPlayingPreview(false);
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playingPreview, previewTimeline.totalDurationSec]);

  const handleExport = async () => {
    if (ayahs.length === 0) return;
    setExportError(null);
    setExported(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await exportVerseMp4({
        ayahs,
        preset,
        options,
        reciter,
        lang: uiLang,
        signal: controller.signal,
        onProgress: setProgress,
      });

      const mp4Url = URL.createObjectURL(res.mp4Blob);
      const thumbUrl = URL.createObjectURL(res.thumbnailBlob);
      const srt = toSrt(previewTimeline.cues);
      const vtt = toVtt(previewTimeline.cues);

      setExported({
        mp4Url,
        mp4Blob: res.mp4Blob,
        thumbUrl,
        srt,
        vtt,
        durationSec: res.totalDurationSec,
      });

      trackEvent({
        name: "video_exported",
        props: {
          preset: preset.id,
          lang: langMode,
          duration: Math.round(res.totalDurationSec),
        },
      });
    } catch (err: any) {
      if (err?.message !== "Export cancelled") {
        setExportError(err?.message || "Video export failed");
      }
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  };

  const handleSplitExport = async () => {
    if (ayahs.length <= 1) return;
    setExportError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      for (let i = 0; i < ayahs.length; i++) {
        const res = await exportVerseMp4({
          ayahs: [ayahs[i]],
          preset,
          options,
          reciter,
          lang: uiLang,
          partLabel: `Part ${i + 1}/${ayahs.length}`,
          signal: controller.signal,
          onProgress: (p) =>
            setProgress({
              pct: p.pct,
              stage: `Part ${i + 1}/${ayahs.length}: ${p.stage}`,
            }),
        });
        const url = URL.createObjectURL(res.mp4Blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Istikhara_${surah}-${ayahs[i].ayahNumber}_part${i + 1}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err?.message !== "Export cancelled") {
        setExportError(err?.message || "Split export failed");
      }
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  };

  const primaryAyah = ayahs[0];
  const baseShareUrl = primaryAyah
    ? `${BRAND.appUrl}/${uiLang}/ayah/${primaryAyah.surahNumber}/${primaryAyah.ayahNumber}`
    : BRAND.appUrl;

  const hashtags = [
    "#Istikhara",
    "#استخارہ",
    "#Quran",
    "#QuranVerse",
    "#قرآن",
    "#IslamicReminder",
  ]
    .slice(0, preset.maxHashtags)
    .join(" ");

  const captionText = primaryAyah
    ? `📖 ${primaryAyah.surahNameEn} ${primaryAyah.surahNumber}:${primaryAyah.ayahNumber}\n${(uiLang === "ur"
        ? primaryAyah.urduText
        : primaryAyah.englishText
      ).slice(0, Math.max(80, preset.captionLimit - 240))}\n🎙 ${getReciterName(
        reciter,
        uiLang
      )}\n🔗 ${baseShareUrl}?utm_source=${preset.id}&utm_medium=social&utm_campaign=verse_video\n${hashtags}`
    : "";

  const handleNativeVideoShare = async () => {
    if (!exported || !primaryAyah) return;
    const file = new File(
      [exported.mp4Blob],
      `Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}.mp4`,
      { type: "video/mp4" }
    );
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Istikhara — استخارہ",
        text: captionText,
        files: [file],
      });
      trackEvent({ name: "video_shared", props: { platform: "native" } });
    }
  };

  const downloadTextFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exceedsDuration =
    previewTimeline.totalDurationSec > preset.maxDurationSec;

  return (
    <div className="min-h-dvh flex flex-col">
      <Head pageKey="studio" lang={uiLang} />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
            {uiLang === "ur"
              ? "قرآنی آیت ویڈیو اسٹوڈیو"
              : "Quran Verse Video Studio"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {uiLang === "ur"
              ? "سوشل میڈیا سیف زون کے ساتھ MP4 تلاوت ویڈیو اور سب ٹائٹلز تیار کریں۔"
              : "Export MP4 Quran recitation videos with social media safe zones, subtitles, and QR branding."}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls */}
          <section className="lg:col-span-5 rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-5 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs space-y-1">
                <span>Surah (1-114)</span>
                <input
                  type="number"
                  min={1}
                  max={114}
                  value={surah}
                  onChange={(e) =>
                    setSurah(Math.max(1, Math.min(114, Number(e.target.value) || 1)))
                  }
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-2 text-sm"
                />
              </label>
              <label className="text-xs space-y-1">
                <span>Start Ayah</span>
                <input
                  type="number"
                  min={1}
                  max={286}
                  value={startAyah}
                  onChange={(e) =>
                    setStartAyah(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-2 text-sm"
                />
              </label>
              <label className="text-xs space-y-1">
                <span>Range (1-5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rangeCount}
                  onChange={(e) =>
                    setRangeCount(Math.max(1, Math.min(5, Number(e.target.value) || 1)))
                  }
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block text-xs space-y-1">
              <span>Platform Safe-Zone Preset</span>
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value as PlatformPresetId)}
                className="w-full rounded-xl border border-[var(--border-gold)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm"
              >
                {PLATFORM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {uiLang === "ur" ? p.labelUr : p.labelEn}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs space-y-1">
                <span>Language</span>
                <select
                  value={langMode}
                  onChange={(e) => setLangMode(e.target.value as VideoLangMode)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-2 text-sm"
                >
                  <option value="ar_ur">Arabic + Urdu</option>
                  <option value="ar_en">Arabic + English</option>
                  <option value="ar_ur_en">Arabic + Urdu + English</option>
                  <option value="ar">Arabic only</option>
                </select>
              </label>

              <label className="block text-xs space-y-1">
                <span>Theme</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as VideoTheme)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-2 text-sm"
                >
                  <option value="midnight_gold">Midnight Gold</option>
                  <option value="emerald">Emerald</option>
                  <option value="ivory">Ivory</option>
                </select>
              </label>
            </div>

            <label className="block text-xs space-y-1">
              <span>Reciter</span>
              <select
                value={reciter}
                onChange={(e) => setReciter(e.target.value as ReciterId)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nameEn}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs space-y-1">
              <span>Arabic Font Size ({arabicFontSize}px)</span>
              <input
                type="range"
                min={34}
                max={74}
                value={arabicFontSize}
                onChange={(e) => setArabicFontSize(Number(e.target.value))}
                className="w-full accent-[#C9A227]"
              />
            </label>

            <div className="flex flex-wrap gap-3 text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReference}
                  onChange={(e) => setShowReference(e.target.checked)}
                />
                Reference
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                />
                QR Code
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSafeZone}
                  onChange={(e) => setShowSafeZone(e.target.checked)}
                />
                Show safe zone
              </label>
            </div>

            {exceedsDuration && (
              <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-200 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    Estimated duration (~{Math.round(previewTimeline.totalDurationSec)}s) exceeds{" "}
                    {preset.maxDurationSec}s limit.
                  </span>
                </div>
                {ayahs.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSplitExport}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-[#0A1A2F] font-semibold"
                  >
                    Split into {ayahs.length} parts
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={loadingAyahs || progress !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)]"
              >
                <Film className="w-4 h-4" aria-hidden="true" />
                {progress ? `${progress.pct}%` : "Export MP4"}
              </button>

              {progress && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="Cancel export"
                  className="px-3 py-3 rounded-xl border border-red-400/40 text-red-300"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {progress && (
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--gold)] transition-all"
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)]">{progress.stage}</p>
              </div>
            )}

            {exportError && (
              <p className="text-xs text-red-300">{exportError}</p>
            )}
          </section>

          {/* Preview + Post-Export Composer */}
          <section className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-4 flex flex-col items-center gap-4">
              <div
                className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-xl overflow-hidden border border-[var(--border-subtle)]"
                style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
              >
                <canvas
                  ref={canvasRef}
                  width={preset.width}
                  height={preset.height}
                  className="w-full h-full block"
                />
                <SafeZoneOverlay preset={preset} visible={showSafeZone} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPlayingPreview((p) => !p)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-gold)] text-sm"
                >
                  {playingPreview ? (
                    <Pause className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Play className="w-4 h-4" aria-hidden="true" />
                  )}
                  {playingPreview ? "Pause Preview" : "Play Preview"}
                </button>
                <span className="text-xs text-[var(--text-muted)]">
                  {previewTime.toFixed(1)}s / {previewTimeline.totalDurationSec.toFixed(1)}s
                </span>
              </div>
            </div>

            {exported && primaryAyah && (
              <div className="rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-5 space-y-4">
                <h2 className="font-display-serif text-xl font-semibold text-[var(--accent-gold)]">
                  Export Ready — Share &amp; Download
                </h2>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={exported.mp4Url}
                    download={`Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}.mp4`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    MP4
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTextFile(
                        exported.srt,
                        `Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}.srt`,
                        "text/plain"
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm"
                  >
                    .SRT
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTextFile(
                        exported.vtt,
                        `Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}.vtt`,
                        "text/vtt"
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm"
                  >
                    .VTT
                  </button>
                  <a
                    href={exported.thumbUrl}
                    download={`Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}_thumb.png`}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border-gold)] text-sm"
                  >
                    Thumbnail PNG
                  </a>
                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <button
                      type="button"
                      onClick={handleNativeVideoShare}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--gold)] text-[var(--accent-gold)] text-sm"
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                      Share File
                    </button>
                  )}
                </div>

                {/* Social Composer */}
                <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>Social Caption</span>
                    <span>
                      {captionText.length} / {preset.captionLimit}
                    </span>
                  </div>
                  <textarea
                    readOnly
                    rows={5}
                    value={captionText}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-primary)]"
                  />
                  {preset.linkInBioHint && (
                    <p className="text-xs text-[var(--accent-gold)]">
                      Tip: Links in Instagram/TikTok captions are not clickable — add the link in your bio.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(captionText);
                      setCopiedCaption(true);
                      setTimeout(() => setCopiedCaption(false), 1800);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-gold)] text-xs"
                  >
                    {copiedCaption ? (
                      <Check className="w-3.5 h-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    {copiedCaption ? "Copied!" : "Copy Caption"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
