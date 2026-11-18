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
import {
  PLATFORMS_916,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  getPlatform916,
  type Platform916Id,
} from "@/config/platforms916";
import { RECITERS, getReciterName, type ReciterId } from "@/config/reciters";
import { URDU_TAFSIRS, getTafsirBySlug } from "@/config/tafsirs";
import { useApp } from "@/lib/i18n";
import { getAyahRange, getQuranIndex, type FetchedAyah, type SurahMeta } from "@/lib/quran";
import { fetchTafseer, type TafseerParagraph } from "@/lib/tafseer";
import { trackEvent } from "@/lib/analytics";
import {
  INTRO_SEC,
  build916Timeline,
  type Studio916Options,
  type TafseerAudioMode,
  type VideoMode,
  type VideoTheme,
} from "@/lib/video/timeline";
import { render916Frame } from "@/lib/video/render";
import { toSrt, toVtt } from "@/lib/video/subtitles";
import {
  export916Mp4,
  loadQrImage916,
  type EncodeProgress,
} from "@/lib/video/encode";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppFooter, AppHeader } from "@/components/AppShell";
import { SafeZoneOverlay } from "@/components/SafeZoneOverlay";
import { Head } from "@/seo/Head";

const STUDIO_STORAGE_KEY = "istikhara:studio916:v1";

interface SavedStudioPrefs {
  mode: VideoMode;
  tafsirSlug: string;
  reciter: ReciterId;
  platformId: Platform916Id;
  theme: VideoTheme;
  arabicMaxSize: number;
  urduMaxSize: number;
  readingSpeed: number;
  showQr: boolean;
  showSurahHeader: boolean;
  tafseerAudio: TafseerAudioMode;
}

function loadStudioPrefs(defaultReciter: ReciterId): SavedStudioPrefs {
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedStudioPrefs;
  } catch {
    // ignore
  }
  return {
    mode: "urdu-tarjuma",
    tafsirSlug: URDU_TAFSIRS[0].slug,
    reciter: defaultReciter,
    platformId: "universal",
    theme: "midnight_gold",
    arabicMaxSize: 56,
    urduMaxSize: 38,
    readingSpeed: 2.2,
    showQr: true,
    showSurahHeader: true,
    tafseerAudio: "silence",
  };
}

export default function Studio() {
  const { uiLang, settings } = useApp();
  const isUrdu = uiLang === "ur";
  const [searchParams] = useSearchParams();
  const initialPrefs = useMemo(
    () => loadStudioPrefs(settings.reciter),
    [settings.reciter]
  );

  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [surah, setSurah] = useState(Number(searchParams.get("s") || 2));
  const [startAyah, setStartAyah] = useState(Number(searchParams.get("a") || 286));
  const [rangeCount, setRangeCount] = useState(1);
  const [ayahs, setAyahs] = useState<FetchedAyah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(true);

  const [mode, setMode] = useState<VideoMode>(initialPrefs.mode);
  const [tafsirSlug, setTafsirSlug] = useState(initialPrefs.tafsirSlug);
  const [tafseerParagraphs, setTafseerParagraphs] = useState<TafseerParagraph[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [tafseerMissing, setTafseerMissing] = useState(false);

  const [reciter, setReciter] = useState<ReciterId>(initialPrefs.reciter);
  const [platformId, setPlatformId] = useState<Platform916Id>(initialPrefs.platformId);
  const [theme, setTheme] = useState<VideoTheme>(initialPrefs.theme);
  const [arabicMaxSize, setArabicMaxSize] = useState(initialPrefs.arabicMaxSize);
  const [urduMaxSize, setUrduMaxSize] = useState(initialPrefs.urduMaxSize);
  const [readingSpeed, setReadingSpeed] = useState(initialPrefs.readingSpeed);
  const [showQr, setShowQr] = useState(initialPrefs.showQr);
  const [showSurahHeader, setShowSurahHeader] = useState(initialPrefs.showSurahHeader);
  const [tafseerAudio, setTafseerAudio] = useState<TafseerAudioMode>(initialPrefs.tafseerAudio);
  const [showSafeZone, setShowSafeZone] = useState(true);

  const [playingPreview, setPlayingPreview] = useState(false);
  const [previewTime, setPreviewTime] = useState(INTRO_SEC + 0.4);
  const [progress, setProgress] = useState<EncodeProgress | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [exported, setExported] = useState<{
    mp4Url: string;
    mp4Blob: Blob;
    coverUrl: string;
    srt: string;
    vtt: string;
    filename: string;
    durationSec: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);

  const platform = useMemo(() => getPlatform916(platformId), [platformId]);
  const tafsirInfo = useMemo(() => getTafsirBySlug(tafsirSlug), [tafsirSlug]);

  // Persist last-used settings
  useEffect(() => {
    try {
      const prefs: SavedStudioPrefs = {
        mode,
        tafsirSlug,
        reciter,
        platformId,
        theme,
        arabicMaxSize,
        urduMaxSize,
        readingSpeed,
        showQr,
        showSurahHeader,
        tafseerAudio,
      };
      localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [
    mode,
    tafsirSlug,
    reciter,
    platformId,
    theme,
    arabicMaxSize,
    urduMaxSize,
    readingSpeed,
    showQr,
    showSurahHeader,
    tafseerAudio,
  ]);

  useEffect(() => {
    getQuranIndex().then((idx) => setSurahs(idx.surahs)).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingAyahs(true);
    getAyahRange(surah, startAyah, rangeCount)
      .then((list) => {
        if (!active) return;
        setAyahs(list);
        if (list[0]) {
          loadQrImage916(list[0]).then((img) => {
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
  }, [surah, startAyah, rangeCount]);

  // Load Urdu tafseer when in Modes B or C
  useEffect(() => {
    if (mode === "urdu-tarjuma") return;
    let active = true;
    setTafseerMissing(false);
    fetchTafseer(tafsirSlug, surah, startAyah)
      .then((res) => {
        if (!active) return;
        if (!res || res.paragraphs.length === 0) {
          setTafseerParagraphs([]);
          setSelectedIndices([]);
          setTafseerMissing(true);
          return;
        }
        setTafseerParagraphs(res.paragraphs);
        // Pre-select first 1-2 paragraphs up to ~120 words
        const picked: number[] = [];
        let words = 0;
        for (const p of res.paragraphs) {
          if (picked.length === 0 || (picked.length < 2 && words + p.wordCount <= 120)) {
            picked.push(p.index);
            words += p.wordCount;
          } else {
            break;
          }
        }
        setSelectedIndices(picked);
      })
      .catch(() => {
        if (active) {
          setTafseerParagraphs([]);
          setSelectedIndices([]);
          setTafseerMissing(true);
        }
      });
    return () => {
      active = false;
    };
  }, [mode, tafsirSlug, surah, startAyah]);

  const selectedTexts = useMemo(
    () =>
      tafseerParagraphs
        .filter((p) => selectedIndices.includes(p.index))
        .map((p) => p.text),
    [tafseerParagraphs, selectedIndices]
  );

  const options: Studio916Options = {
    mode,
    theme,
    arabicMaxSize,
    urduMaxSize,
    showQr,
    showSurahHeader,
    readingSpeed,
    tafseerAudio,
    tafsirNameUr: tafsirInfo.nameUr,
    tafsirAuthorUr: tafsirInfo.authorUr,
  };

  const previewTimeline = useMemo(() => {
    const estDurations = ayahs.map((a) => Math.max(4, a.arabicText.length * 0.08));
    return build916Timeline(ayahs, estDurations, selectedTexts, options);
  }, [ayahs, selectedTexts, mode, theme, arabicMaxSize, urduMaxSize, readingSpeed, showQr, showSurahHeader, tafsirInfo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ayahs.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    render916Frame(
      ctx,
      Math.min(previewTime, previewTimeline.totalDurationSec),
      previewTimeline.totalDurationSec,
      previewTimeline.frames,
      options,
      reciter,
      qrImgRef.current
    );
  }, [previewTime, previewTimeline, options, reciter, ayahs.length]);

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
      const res = await export916Mp4({
        ayahs,
        selectedTafseerParagraphs: selectedTexts,
        options,
        reciter,
        signal: controller.signal,
        onProgress: setProgress,
      });

      const primary = ayahs[0];
      const safeSurah = primary.surahNameEn.replace(/[^a-zA-Z0-9_-]/g, "");
      const modeSlug = mode === "urdu-tarjuma" ? "urdu-tarjuma" : "urdu-tafseer";
      const filename = `Istikhara_${safeSurah}_${primary.surahNumber}-${primary.ayahNumber}_${modeSlug}_9x16.mp4`;

      setExported({
        mp4Url: URL.createObjectURL(res.mp4Blob),
        mp4Blob: res.mp4Blob,
        coverUrl: URL.createObjectURL(res.coverBlob),
        srt: toSrt(previewTimeline.cues),
        vtt: toVtt(previewTimeline.cues),
        filename,
        durationSec: res.totalDurationSec,
      });

      trackEvent({
        name: "video_exported",
        props: {
          preset: platform.id,
          lang: mode,
          duration: Math.round(res.totalDurationSec),
        },
      });
    } catch (err: any) {
      if (err?.message !== "Export cancelled") {
        setExportError(err?.message || "Export failed");
      }
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  };

  const handleSplitExport = async () => {
    if (ayahs.length === 0) return;
    setExportError(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Split into parts by ayah (or 1 part per tafseer paragraph group)
      const parts =
        ayahs.length > 1
          ? ayahs.map((a) => ({ partAyahs: [a], paras: selectedTexts }))
          : selectedTexts.map((p) => ({ partAyahs: ayahs, paras: [p] }));

      for (let i = 0; i < parts.length; i++) {
        const label = `حصہ ${i + 1}/${parts.length}`;
        const res = await export916Mp4({
          ayahs: parts[i].partAyahs,
          selectedTafseerParagraphs: parts[i].paras,
          options,
          reciter,
          partLabel: label,
          signal: controller.signal,
          onProgress: (p) =>
            setProgress({
              ...p,
              stage: `${label}: ${p.stage}`,
            }),
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.mp4Blob);
        a.download = `Istikhara_${surah}-${startAyah}_part${i + 1}_9x16.mp4`;
        a.click();
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
  const shareUrl = primaryAyah
    ? `${BRAND.appUrl}/ur/ayah/${primaryAyah.surahNumber}/${primaryAyah.ayahNumber}?utm_source=${platform.id}&utm_medium=social&utm_campaign=verse_video_916`
    : BRAND.appUrl;

  const captionText = primaryAyah
    ? `📖 سورۃ ${primaryAyah.surahNameAr} ${primaryAyah.surahNumber}:${primaryAyah.ayahNumber}\n${primaryAyah.urduText.slice(0, 120).trim()}…\n🎙 تلاوت: ${getReciterName(reciter, "ur")}${mode !== "urdu-tarjuma" ? `   📚 تفسیر: ${tafsirInfo.nameUr}` : ""}\n🔗 ${shareUrl}\n#استخارہ #Istikhara #QuranVerse #قرآن #تفسیر #IslamicReels`
    : "";

  const exceedsDuration =
    platform.maxDurationSec !== null &&
    previewTimeline.totalDurationSec > platform.maxDurationSec;

  const downloadText = (content: string, name: string, mime: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = name;
    a.click();
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <Head pageKey="studio" lang={uiLang} />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="font-display-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-gold)]">
            قرآنی آیت ویڈیو میکر / Quran Verse Video Maker
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isUrdu
              ? "انسٹاگرام ریلز، ٹک ٹاک، شارٹس اور واٹس ایپ اسٹیٹس کے لیے 9:16 (1080×1920) MP4 ویڈیو"
              : "Vertical 9:16 (1080×1920) MP4 with Urdu translation or Urdu tafseer, safe across all social platforms."}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left/Top: Live 9:16 Preview */}
          <section className="lg:col-span-5 rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-4 flex flex-col items-center gap-4">
            <div
              className="relative w-full max-w-[300px] sm:max-w-[330px] rounded-xl overflow-hidden border border-[var(--border-subtle)]"
              style={{ aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}` }}
            >
              <canvas
                ref={canvasRef}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                className="w-full h-full block"
              />
              <SafeZoneOverlay platform={platform} visible={showSafeZone} />
            </div>

            {/* Scrubber & Controls */}
            <div className="w-full space-y-2">
              <input
                type="range"
                min={0}
                max={Math.max(1, previewTimeline.totalDurationSec)}
                step={0.1}
                value={Math.min(previewTime, previewTimeline.totalDurationSec)}
                onChange={(e) => setPreviewTime(Number(e.target.value))}
                aria-label="Video timeline scrubber"
                className="w-full accent-[#C9A227]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPlayingPreview((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-gold)]"
                >
                  {playingPreview ? (
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {playingPreview ? "Pause" : "Play"}
                </button>
                <span className="text-[var(--text-muted)]">
                  {previewTime.toFixed(1)}s / {previewTimeline.totalDurationSec.toFixed(1)}s
                </span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSafeZone}
                    onChange={(e) => setShowSafeZone(e.target.checked)}
                  />
                  Safe zone
                </label>
              </div>
            </div>
          </section>

          {/* Right/Bottom: Studio Controls */}
          <section className="lg:col-span-7 rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-card)] p-5 space-y-5">
            {/* Verse & Range Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <label className="sm:col-span-2 text-xs space-y-1">
                <span>سورۃ / Surah</span>
                <select
                  value={surah}
                  onChange={(e) => {
                    setSurah(Number(e.target.value));
                    setStartAyah(1);
                  }}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm"
                >
                  {surahs.length > 0 ? (
                    surahs.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.name} — {s.englishName}
                      </option>
                    ))
                  ) : (
                    <option value={surah}>Surah {surah}</option>
                  )}
                </select>
              </label>

              <label className="text-xs space-y-1">
                <span>آیت / Ayah</span>
                <input
                  type="number"
                  min={1}
                  max={286}
                  value={startAyah}
                  onChange={(e) => setStartAyah(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="text-xs space-y-1">
                <span>تعداد / Range (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rangeCount}
                  onChange={(e) =>
                    setRangeCount(Math.max(1, Math.min(5, Number(e.target.value) || 1)))
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            {/* Video Mode */}
            <div className="space-y-1.5">
              <span className="block text-xs text-[var(--text-secondary)]">
                ویڈیو موڈ / Video Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: "urdu-tarjuma", label: "اردو ترجمہ" },
                    { id: "urdu-tafseer", label: "اردو تفسیر" },
                    { id: "tafseer-only", label: "صرف تفسیر" },
                  ] as Array<{ id: VideoMode; label: string }>
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                      mode === m.id
                        ? "bg-[var(--gold)] text-[#0A1A2F] border-[var(--gold)] font-semibold"
                        : "border-[var(--border-subtle)] text-[var(--text-primary)]"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tafseer Source & Paragraph Excerpt Picker (Modes B & C) */}
            {mode !== "urdu-tarjuma" && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs space-y-1">
                    <span>تفسیر ماخذ / Tafseer Source</span>
                    <select
                      value={tafsirSlug}
                      onChange={(e) => setTafsirSlug(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-gold)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                    >
                      {URDU_TAFSIRS.map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.nameUr} — {t.authorUr}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs space-y-1">
                    <span>پڑھنے کی رفتار ({readingSpeed.toFixed(1)} الفاظ/سیکنڈ)</span>
                    <input
                      type="range"
                      min={1.5}
                      max={3.5}
                      step={0.1}
                      value={readingSpeed}
                      onChange={(e) => setReadingSpeed(Number(e.target.value))}
                      className="w-full accent-[#C9A227]"
                    />
                  </label>
                </div>

                {tafseerMissing ? (
                  <p className="text-xs text-amber-300 font-urdu-nastaliq">
                    اس آیت کی تفسیر اس ماخذ میں دستیاب نہیں — براہ کرم اوپر سے کوئی دوسرا تفسیر ماخذ منتخب کریں۔
                  </p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {tafseerParagraphs.map((p) => {
                      const checked = selectedIndices.includes(p.index);
                      const estSec = Math.max(4, Math.round(p.wordCount / readingSpeed));
                      return (
                        <label
                          key={p.index}
                          className="flex items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] p-2.5 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedIndices((prev) =>
                                prev.includes(p.index)
                                  ? prev.filter((x) => x !== p.index)
                                  : [...prev, p.index].sort((a, b) => a - b)
                              )
                            }
                            className="mt-1 accent-[#C9A227]"
                          />
                          <div className="space-y-1 flex-1">
                            <p className="font-urdu-nastaliq text-[var(--text-primary)] line-clamp-2" dir="rtl">
                              {p.text}
                            </p>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {p.wordCount} words • ~{estSec}s
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Platform, Reciter, Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="text-xs space-y-1">
                <span>Preview Platform</span>
                <select
                  value={platformId}
                  onChange={(e) => setPlatformId(e.target.value as Platform916Id)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-2 text-sm"
                >
                  {PLATFORMS_916.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isUrdu ? p.labelUr : p.labelEn}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs space-y-1">
                <span>قاری / Reciter</span>
                <select
                  value={reciter}
                  onChange={(e) => setReciter(e.target.value as ReciterId)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5 py-2 text-sm"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {isUrdu ? r.nameUr : r.nameEn}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs space-y-1">
                <span>تھیم / Theme</span>
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

            {/* Sliders & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span>عربی سائز ({arabicMaxSize}px)</span>
                <input
                  type="range"
                  min={40}
                  max={64}
                  value={arabicMaxSize}
                  onChange={(e) => setArabicMaxSize(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </label>
              <label className="space-y-1">
                <span>اردو سائز ({urduMaxSize}px)</span>
                <input
                  type="range"
                  min={32}
                  max={42}
                  value={urduMaxSize}
                  onChange={(e) => setUrduMaxSize(Number(e.target.value))}
                  className="w-full accent-[#C9A227]"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
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
                  checked={showSurahHeader}
                  onChange={(e) => setShowSurahHeader(e.target.checked)}
                />
                Surah Header
              </label>
              {mode !== "urdu-tarjuma" && (
                <label className="inline-flex items-center gap-2">
                  <span>تفسیر آڈیو:</span>
                  <select
                    value={tafseerAudio}
                    onChange={(e) => setTafseerAudio(e.target.value as TafseerAudioMode)}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-xs"
                  >
                    <option value="silence">خاموشی (Silence)</option>
                    <option value="repeat_50">تلاوت 50% والیوم</option>
                  </select>
                </label>
              )}
            </div>

            {/* Length warning */}
            {exceedsDuration && platform.maxDurationSec && (
              <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-200 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    یہ ویڈیو {platform.labelUr} کی حد ({platform.maxDurationSec}s) سے لمبی ہے۔
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSplitExport}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-[#0A1A2F] font-semibold"
                  >
                    Split into parts
                  </button>
                  {mode !== "urdu-tarjuma" && selectedIndices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedIndices((prev) => prev.slice(0, 1))}
                      className="px-3 py-1.5 rounded-lg border border-amber-300/50 text-amber-100"
                    >
                      Reduce tafseer paragraphs
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Download MP4 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={loadingAyahs || progress !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-sm hover:bg-[var(--gold-soft)]"
              >
                <Film className="w-4 h-4" aria-hidden="true" />
                {progress
                  ? `${progress.pct}% (${progress.etaSec}s)`
                  : "MP4 ڈاؤن لوڈ کریں / Download MP4"}
              </button>
              {progress && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="Cancel"
                  className="px-3.5 rounded-xl border border-red-400/40 text-red-300"
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

            {exportError && <p className="text-xs text-red-300">{exportError}</p>}

            {/* Post-Export Downloads & Social Composer */}
            {exported && primaryAyah && (
              <div className="rounded-xl border border-[var(--border-gold)] bg-[var(--bg-primary)]/60 p-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={exported.mp4Url}
                    download={exported.filename}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--gold)] text-[#0A1A2F] font-semibold text-xs"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    MP4
                  </a>
                  <a
                    href={exported.coverUrl}
                    download={`Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}_cover.png`}
                    className="px-3 py-2 rounded-xl border border-[var(--border-gold)] text-xs"
                  >
                    Cover PNG (3:4 safe)
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      downloadText(
                        exported.srt,
                        `Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}.srt`,
                        "text/plain"
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-[var(--border-gold)] text-xs"
                  >
                    .SRT
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadText(
                        exported.vtt,
                        `Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}.vtt`,
                        "text/vtt"
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-[var(--border-gold)] text-xs"
                  >
                    .VTT
                  </button>
                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <button
                      type="button"
                      onClick={async () => {
                        const file = new File([exported.mp4Blob], exported.filename, {
                          type: "video/mp4",
                        });
                        if (navigator.canShare?.({ files: [file] })) {
                          await navigator.share({
                            title: "Istikhara — استخارہ",
                            text: captionText,
                            files: [file],
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--gold)] text-[var(--accent-gold)] text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      شیئر کریں
                    </button>
                  )}
                </div>

                {/* Caption Composer */}
                <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>کیپشن / Caption</span>
                    <span>
                      {captionText.length} / {platform.captionLimit}
                    </span>
                  </div>
                  <textarea
                    readOnly
                    rows={5}
                    value={captionText}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2.5 text-xs"
                  />
                  {platform.linkInBioHint && (
                    <p className="text-xs text-[var(--accent-gold)]">
                      لنک بائیو میں — Instagram/TikTok captions do not make links clickable.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(captionText);
                      setCopiedCaption(true);
                      setTimeout(() => setCopiedCaption(false), 1800);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-gold)] text-xs"
                  >
                    {copiedCaption ? (
                      <Check className="w-3.5 h-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    {copiedCaption ? "کاپی ہو گیا" : "Copy Caption"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
