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
import type { EncodeProgress } from "@/lib/video/encode";
import QRCode from "qrcode";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppFooter, AppHeader } from "@/components/AppShell";
import { SafeZoneOverlay } from "@/components/SafeZoneOverlay";
import { StoreBadges } from "@/components/StoreBadges";
import { saveAndShareBlob } from "@/lib/nativeFiles";
import { adService } from "@/lib/ads/adService";
import { isNative } from "@/lib/platform";
import { Head } from "@/seo/Head";
import { GlassCard, GlassSkeleton } from "@/components/glass";
import { VersePicker } from "@/components/studio/VersePicker";
import { StudioControlsPanel, type StudioTabId } from "@/components/studio/StudioControlsPanel";
import { getEveryAyahUrl } from "@/config/reciters";
import { getTopicBadgeForSurah } from "@/content/hooks";
import {
  getTemplateById,
  type CaptionStyle,
  type PageTransition,
  type ShortsTemplate,
  type TemplateId,
} from "@/config/templates";
import {
  loadCustomHand,
  saveCustomHand,
  type CustomHandConfig,
  type HandAssetId,
  type HandRenderStyle,
  type HandSkinTone,
  type HandStyleMode,
} from "@/lib/video/handAssets";
import { shapeWordToGlyphPaths } from "@/lib/video/harfbuzzWrite";
import { tokenizeQuranWords } from "@/lib/video/wordTiming";
import type {
  BgCategory,
  GradientBgConfig,
  MediaBgConfig,
  PaperStyle,
  SolidBgConfig,
} from "@/lib/video/backgrounds";
import type { TextLanguageDisplay } from "@/lib/video/timeline";
import {
  ARABIC_QURAN_FONTS,
  URDU_FONTS,
  ensureFontsLoaded,
  getDefaultArabicFont,
  getDefaultScript,
  type ArabicFontId,
  type QuranScript,
  type UrduFontId,
} from "@/config/fonts";
import type { PointerStyle } from "@/lib/video/pointers";
import type { BgStyle, MotionIntensity } from "@/lib/video/backgrounds";
import {
  DEFAULT_VOICE_ID,
  URDU_VOICES,
  VOICE_RATE_DEFAULT,
  VOICE_RATE_MAX,
  VOICE_RATE_MIN,
  getVoiceById,
  type VoiceMode,
} from "@/config/voices";
import { VoiceRecorder } from "@/components/studio/VoiceRecorder";
import {
  loadSurahTimings,
  loadSurahWordsUr,
  type AyahTimingEntry,
} from "@/lib/video/wordTiming";
import { base64ToArrayBuffer, synthesizeUrduTts } from "@/lib/tts";
import { trimAudioBuffer } from "@/lib/video/audioMix";

const STUDIO_STORAGE_KEY = "istikhara:studio916:v1";

interface SavedStudioPrefs {
  mode: VideoMode;
  tafsirSlug: string;
  reciter: ReciterId;
  platformId: Platform916Id;
  theme: VideoTheme;
  script?: QuranScript;
  arabicFont?: ArabicFontId;
  urduFont?: UrduFontId;
  pointerStyle?: PointerStyle;
  wordByWordMeaning?: boolean;
  bgStyle?: BgStyle;
  motionIntensity?: MotionIntensity;
  audioReactiveGlow?: boolean;
  particles?: boolean;
  voiceMode?: VoiceMode;
  voiceId?: string;
  voiceRate?: number;
  userVoiceName?: string;
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
  const [ayahError, setAyahError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [mode, setMode] = useState<VideoMode>(initialPrefs.mode);
  const [tafsirSlug, setTafsirSlug] = useState(initialPrefs.tafsirSlug);
  const [tafseerParagraphs, setTafseerParagraphs] = useState<TafseerParagraph[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [tafseerMissing, setTafseerMissing] = useState(false);

  const [reciter, setReciter] = useState<ReciterId>(initialPrefs.reciter);
  const [platformId, setPlatformId] = useState<Platform916Id>(initialPrefs.platformId);
  const defaultScript = settings.script ?? getDefaultScript(uiLang);
  const [script, setScript] = useState<QuranScript>(initialPrefs.script ?? defaultScript);
  const [arabicFont, setArabicFont] = useState<ArabicFontId>(
    initialPrefs.arabicFont ?? getDefaultArabicFont(initialPrefs.script ?? defaultScript)
  );
  const [urduFont, setUrduFont] = useState<UrduFontId>(
    initialPrefs.urduFont ?? "noto-nastaliq"
  );
  const [pointerStyle, setPointerStyle] = useState<PointerStyle>(
    initialPrefs.pointerStyle ?? "hand"
  );
  const [wordByWordMeaning, setWordByWordMeaning] = useState<boolean>(
    initialPrefs.wordByWordMeaning ?? false
  );
  const [bgStyle, setBgStyle] = useState<BgStyle>(
    initialPrefs.bgStyle ?? "girih"
  );
  const [motionIntensity, setMotionIntensity] = useState<MotionIntensity>(
    initialPrefs.motionIntensity ?? "calm"
  );
  const [audioReactiveGlow, setAudioReactiveGlow] = useState<boolean>(
    initialPrefs.audioReactiveGlow ?? true
  );
  const [particles, setParticles] = useState<boolean>(
    initialPrefs.particles ?? false
  );
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(
    initialPrefs.voiceMode ?? "none"
  );
  const [voiceId, setVoiceId] = useState<string>(
    initialPrefs.voiceId ?? DEFAULT_VOICE_ID
  );
  const [voiceRate, setVoiceRate] = useState<number>(
    initialPrefs.voiceRate ?? VOICE_RATE_DEFAULT
  );
  const [userVoiceName, setUserVoiceName] = useState<string>(
    initialPrefs.userVoiceName ?? ""
  );
  const [recordedVoice, setRecordedVoice] = useState<{
    blob: Blob;
    url: string;
    durationSec: number;
    trimStartSec: number;
    trimEndSec: number;
  } | null>(null);
  const [ayahWordData, setAyahWordData] = useState<
    Array<{ entry?: AyahTimingEntry | null; meaningsUr?: string[] }>
  >([]);
  const [studioTab, setStudioTab] = useState<StudioTabId>("template");
  const [templateId, setTemplateId] = useState<TemplateId>("geometric_night");
  const [bgCategory, setBgCategory] = useState<BgCategory>("geometric");
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("whiteboard");
  const [solidConfig, setSolidConfig] = useState<SolidBgConfig>({
    color: "#0A1A2F",
    grainPct: 0,
  });
  const [gradientConfig, setGradientConfig] = useState<GradientBgConfig>({
    stops: ["#0A1A2F", "#0B3D2E"],
    type: "linear",
    angleDeg: 145,
    drift: true,
  });
  const [mediaConfig, setMediaConfig] = useState<MediaBgConfig>({
    blurPx: 8,
    darkenPct: 45,
    tintColor: "#0A1A2F",
    tintPct: 15,
    kenBurns: true,
    kenBurnsDir: "in",
    vignette: true,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [handStyle, setHandStyle] = useState<HandStyleMode>("finger_pointer");
  const [handAsset, setHandAsset] = useState<HandAssetId>("finger");
  const [handRenderStyle, setHandRenderStyle] = useState<HandRenderStyle>("line_art");
  const [handSkinTone, setHandSkinTone] = useState<HandSkinTone>("medium");
  const [handSleeveColor, setHandSleeveColor] = useState("#0B3D2E");
  const [handScale, setHandScale] = useState(1);
  const [customHand, setCustomHand] = useState<CustomHandConfig | null>(() => loadCustomHand());
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("boxed");
  const [transition, setTransition] = useState<PageTransition>("fade");
  const [languageDisplay, setLanguageDisplay] = useState<TextLanguageDisplay>("ar_ur");
  const [showReference, setShowReference] = useState(true);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showHookCard, setShowHookCard] = useState(false);
  const [hookText, setHookText] = useState("");
  const [showEndScreen, setShowEndScreen] = useState(true);
  const [loopFriendly, setLoopFriendly] = useState(false);
  const [savedPresets, setSavedPresets] = useState<Array<{ name: string; data: Record<string, unknown> }>>(() => {
    try {
      const raw = localStorage.getItem("istikhara:studio-presets:v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const mediaSourceRef = useRef<CanvasImageSource | null>(null);
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number }>({
    width: 1080,
    height: 1920,
  });
  const customHandImgRef = useRef<HTMLImageElement | null>(null);
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
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
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
    script,
    arabicFont,
    urduFont,
    pointerStyle,
    wordByWordMeaning,
    bgStyle,
    motionIntensity,
    audioReactiveGlow,
    particles,
    voiceMode,
    voiceId,
    voiceRate,
    userVoiceName,
  ]);

  useEffect(() => {
    if (ayahs.length === 0) return;
    let active = true;
    Promise.all(
      ayahs.map(async (a) => {
        const [tFile, wUr] = await Promise.all([
          loadSurahTimings(reciter, a.surahNumber),
          wordByWordMeaning ? loadSurahWordsUr(a.surahNumber) : Promise.resolve(null),
        ]);
        return {
          entry: tFile?.ayahs.find((x) => x.ayah === a.ayahNumber) ?? null,
          meaningsUr: wUr?.[String(a.ayahNumber)] ?? [],
        };
      })
    ).then((res) => {
      if (active) setAyahWordData(res);
    });
    return () => {
      active = false;
    };
  }, [ayahs, reciter, wordByWordMeaning]);

  useEffect(() => {
    getQuranIndex().then((idx) => setSurahs(idx.surahs)).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingAyahs(true);
    setAyahError(false);
    getAyahRange(surah, startAyah, rangeCount, script, arabicFont)
      .then((list) => {
        if (!active) return;
        if (list.length === 0) {
          setAyahError(true);
          return;
        }
        setAyahs(list);
        setPreviewTime(INTRO_SEC + 0.35);
        if (list[0]) {
          const qrUrl = `${BRAND.appUrl}/ur/ayah/${list[0].surahNumber}/${list[0].ayahNumber}`;
          QRCode.toDataURL(qrUrl, {
            width: 240,
            margin: 1,
            color: { dark: "#0A1A2F", light: "#F7F1E3" },
          })
            .then((dataUrl) => {
              const img = new Image();
              img.onload = () => {
                qrImgRef.current = img;
              };
              img.src = dataUrl;
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (active) setAyahError(true);
      })
      .finally(() => {
        if (active) setLoadingAyahs(false);
      });
    return () => {
      active = false;
    };
  }, [surah, startAyah, rangeCount, script, arabicFont, retryCount]);

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

  const voiceInfo = useMemo(() => getVoiceById(voiceId), [voiceId]);
  const voiceCreditUr =
    voiceMode === "ai-translation" || voiceMode === "ai-tafseer"
      ? `AI آواز: ${voiceInfo.voiceId}`
      : voiceMode === "record"
        ? userVoiceName.trim()
          ? `آواز: ${userVoiceName.trim()}`
          : "آواز: صارف کی ریکارڈنگ"
        : undefined;

  const voicePromptText = useMemo(() => {
    if (voiceMode === "ai-tafseer" || (voiceMode === "record" && mode !== "urdu-tarjuma" && selectedTexts.length > 0)) {
      return selectedTexts.join(" ");
    }
    return ayahs.map((a) => a.urduText).join(" ");
  }, [voiceMode, mode, selectedTexts, ayahs]);

  const topicBadgeObj = getTopicBadgeForSurah(surah);
  const activeTpl = getTemplateById(templateId);

  const applyTemplate = (tpl: ShortsTemplate) => {
    setTemplateId(tpl.id);
    setBgCategory(tpl.bgCategory);
    setBgStyle(tpl.bgStyle);
    setPaperStyle(tpl.paperStyle);
    setSolidConfig(tpl.solidConfig);
    setGradientConfig(tpl.gradientConfig);
    setMediaConfig(tpl.mediaConfig);
    setTheme(tpl.theme);
    setScript(tpl.script);
    setArabicFont(tpl.arabicFont);
    setUrduFont(tpl.urduFont);
    setHandStyle(tpl.handStyle);
    setHandAsset(tpl.handAsset);
    setHandRenderStyle(tpl.handRenderStyle);
    setCaptionStyle(tpl.captionStyle);
    setTransition(tpl.transition);
  };

  const handleSaveStylePreset = (name: string) => {
    const data = {
      templateId,
      bgCategory,
      bgStyle,
      paperStyle,
      solidConfig,
      gradientConfig,
      mediaConfig,
      theme,
      script,
      arabicFont,
      urduFont,
      languageDisplay,
      handStyle,
      handAsset,
      handRenderStyle,
      handSkinTone,
      handSleeveColor,
      handScale,
      captionStyle,
      transition,
      arabicMaxSize,
      urduMaxSize,
    };
    const next = [...savedPresets.filter((p) => p.name !== name), { name, data }];
    setSavedPresets(next);
    try {
      localStorage.setItem("istikhara:studio-presets:v1", JSON.stringify(next));
    } catch {}
  };

  const handleLoadStylePreset = (name: string) => {
    const found = savedPresets.find((p) => p.name === name);
    if (!found) return;
    const d = found.data as Record<string, any>;
    if (d.templateId) setTemplateId(d.templateId);
    if (d.bgCategory) setBgCategory(d.bgCategory);
    if (d.bgStyle) setBgStyle(d.bgStyle);
    if (d.paperStyle) setPaperStyle(d.paperStyle);
    if (d.solidConfig) setSolidConfig(d.solidConfig);
    if (d.gradientConfig) setGradientConfig(d.gradientConfig);
    if (d.mediaConfig) setMediaConfig(d.mediaConfig);
    if (d.theme) setTheme(d.theme);
    if (d.script) setScript(d.script);
    if (d.arabicFont) setArabicFont(d.arabicFont);
    if (d.urduFont) setUrduFont(d.urduFont);
    if (d.languageDisplay) setLanguageDisplay(d.languageDisplay);
    if (d.handStyle) setHandStyle(d.handStyle);
    if (d.handAsset) setHandAsset(d.handAsset);
    if (d.handRenderStyle) setHandRenderStyle(d.handRenderStyle);
    if (d.handSkinTone) setHandSkinTone(d.handSkinTone);
    if (d.handSleeveColor) setHandSleeveColor(d.handSleeveColor);
    if (typeof d.handScale === "number") setHandScale(d.handScale);
    if (d.captionStyle) setCaptionStyle(d.captionStyle);
    if (d.transition) setTransition(d.transition);
    if (typeof d.arabicMaxSize === "number") setArabicMaxSize(d.arabicMaxSize);
    if (typeof d.urduMaxSize === "number") setUrduMaxSize(d.urduMaxSize);
  };

  const loadMediaSource = (blobOrUrl: Blob | string, kind: "image" | "video", credit?: string) => {
    const url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    if (kind === "image") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        mediaSourceRef.current = img;
        setMediaDimensions({ width: img.naturalWidth || 1080, height: img.naturalHeight || 1920 });
        if (credit) setMediaConfig((m) => ({ ...m, credit }));
      };
      img.src = url;
    } else {
      const vid = document.createElement("video");
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.onloadeddata = () => {
        mediaSourceRef.current = vid;
        setMediaDimensions({ width: vid.videoWidth || 1080, height: vid.videoHeight || 1920 });
        vid.play().catch(() => {});
      };
      vid.src = url;
    }
  };

  useEffect(() => {
    if (!customHand?.dataUrl) {
      customHandImgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      customHandImgRef.current = img;
    };
    img.src = customHand.dataUrl;
  }, [customHand?.dataUrl]);

  // Pre-shape HarfBuzz word paths whenever Doodle Write or Qalam Write is active
  useEffect(() => {
    if (ayahs.length === 0) return;
    if (handStyle !== "doodle_write" && handStyle !== "qalam_write") return;
    const allTokens = ayahs.flatMap((a) => tokenizeQuranWords(a.arabicText));
    Promise.all(allTokens.map((w) => shapeWordToGlyphPaths(w, script))).catch(() => {});
  }, [ayahs, handStyle, script]);

  const options: Studio916Options = {
    mode,
    theme,
    bgCategory,
    bgStyle,
    paperStyle,
    solidConfig,
    gradientConfig,
    mediaConfig,
    motionIntensity,
    audioReactiveGlow,
    particles,
    script,
    arabicFont,
    urduFont,
    languageDisplay,
    pointerStyle,
    handStyle,
    handAsset,
    handRenderStyle,
    handSkinTone,
    handSleeveColor,
    handScale,
    wordByWordMeaning,
    arabicMaxSize,
    urduMaxSize,
    showQr,
    showSurahHeader,
    showReference,
    readingSpeed,
    tafseerAudio,
    tafsirNameUr: tafsirInfo.nameUr,
    tafsirAuthorUr: tafsirInfo.authorUr,
    voiceCreditUr,
    templateId,
    captionStyle,
    transition,
    showProgressBar,
    showHookCard,
    hookText,
    topicBadge: topicBadgeObj ? (isUrdu ? topicBadgeObj.ur : topicBadgeObj.en) : undefined,
    showEndScreen,
    loopFriendly,
    kineticSingleWord: activeTpl.kineticSingleWord,
    ornamentalBorder: activeTpl.ornamentalBorder,
    doodleBrackets: activeTpl.doodleBrackets,
    chalkTexture: activeTpl.chalkTexture,
    photoCredit: mediaConfig.credit,
  };

  const previewTimeline = useMemo(() => {
    const estDurations = ayahs.map((a, i) => {
      const entry = ayahWordData[i]?.entry;
      if (entry && entry.toMs > entry.fromMs) {
        return Math.max(2, (entry.toMs - entry.fromMs) / 1000);
      }
      return Math.max(4, a.arabicText.length * 0.08);
    });
    const voPreview =
      voiceMode !== "none" && voicePromptText.trim()
        ? {
            text: voicePromptText,
            durationSec:
              voiceMode === "record" && recordedVoice
                ? Math.max(1, recordedVoice.trimEndSec - recordedVoice.trimStartSec)
                : Math.max(3, voicePromptText.split(/\s+/).length / 2.2),
          }
        : undefined;
    return build916Timeline(
      ayahs,
      estDurations,
      selectedTexts,
      options,
      ayahWordData,
      voPreview
    );
  }, [
    ayahs,
    ayahWordData,
    selectedTexts,
    mode,
    theme,
    bgCategory,
    bgStyle,
    paperStyle,
    solidConfig,
    gradientConfig,
    mediaConfig,
    motionIntensity,
    audioReactiveGlow,
    particles,
    script,
    arabicFont,
    urduFont,
    languageDisplay,
    pointerStyle,
    handStyle,
    handAsset,
    handRenderStyle,
    handSkinTone,
    handSleeveColor,
    handScale,
    wordByWordMeaning,
    arabicMaxSize,
    urduMaxSize,
    readingSpeed,
    showQr,
    showSurahHeader,
    showReference,
    templateId,
    captionStyle,
    transition,
    showProgressBar,
    showHookCard,
    hookText,
    showEndScreen,
    loopFriendly,
    isUrdu,
    tafsirInfo,
    voiceMode,
    voiceCreditUr,
    voicePromptText,
    recordedVoice,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ayahs.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const drawNow = () => {
      if (cancelled) return;
      render916Frame(
        ctx,
        Math.min(previewTime, previewTimeline.totalDurationSec),
        previewTimeline.totalDurationSec,
        previewTimeline.frames,
        options,
        reciter,
        qrImgRef.current,
        "پریویو",
        0,
        {
          mediaSource: mediaSourceRef.current,
          mediaDimensions,
          customHandImg: customHandImgRef.current,
          customHand,
        }
      );
    };

    // Draw immediately (no blank canvas), then refresh after 150ms debounce & font load
    drawNow();
    const timer = window.setTimeout(() => {
      ensureFontsLoaded().then(drawNow).catch(drawNow);
    }, playingPreview ? 0 : 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ayahs, previewTime, previewTimeline, reciter, playingPreview]);

  // Sync recitation audio with preview Play/Pause
  useEffect(() => {
    if (!playingPreview || ayahs.length === 0) {
      previewAudioRef.current?.pause();
      return;
    }
    const a = ayahs[0];
    const url = getEveryAyahUrl(reciter, a.surahNumber, a.ayahNumber);
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(url);
    } else if (previewAudioRef.current.src !== url) {
      previewAudioRef.current.src = url;
    }
    if (previewTime >= INTRO_SEC && previewTime <= previewTimeline.recitationEndSec) {
      previewAudioRef.current.play().catch(() => {});
    }
    return () => {
      previewAudioRef.current?.pause();
    };
  }, [playingPreview, reciter, ayahs]);

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
      let voiceoverPayload: { buffer: AudioBuffer; text: string } | null = null;

      if (voiceMode === "ai-translation" || voiceMode === "ai-tafseer") {
        setProgress({ pct: 2, etaSec: 18, stage: "AI آواز تیار ہو رہی ہے…" });
        const tts = await synthesizeUrduTts({
          text: voicePromptText,
          voiceId,
          rate: voiceRate,
        });
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const tmpCtx = new AudioCtx();
        try {
          const decoded = await tmpCtx.decodeAudioData(
            base64ToArrayBuffer(tts.audioBase64)
          );
          voiceoverPayload = { buffer: decoded, text: voicePromptText };
        } finally {
          await tmpCtx.close();
        }
      } else if (voiceMode === "record" && recordedVoice) {
        setProgress({ pct: 2, etaSec: 18, stage: "ریکارڈنگ پروسیس ہو رہی ہے…" });
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const tmpCtx = new AudioCtx();
        try {
          const arr = await recordedVoice.blob.arrayBuffer();
          const decoded = await tmpCtx.decodeAudioData(arr);
          const trimmed = trimAudioBuffer(
            tmpCtx,
            decoded,
            recordedVoice.trimStartSec,
            recordedVoice.trimEndSec
          );
          voiceoverPayload = { buffer: trimmed, text: voicePromptText };
        } finally {
          await tmpCtx.close();
        }
      }

      const { export916Mp4 } = await import("@/lib/video/encode");
      const res = await export916Mp4({
        ayahs,
        selectedTafseerParagraphs: selectedTexts,
        options,
        reciter,
        voiceover: voiceoverPayload,
        extras: {
          mediaSource: mediaSourceRef.current,
          mediaDimensions,
          customHandImg: customHandImgRef.current,
          customHand,
        },
        signal: controller.signal,
        onProgress: setProgress,
      });

      const primary = ayahs[0];
      const safeSurah = primary.surahNameEn.replace(/[^a-zA-Z0-9_-]/g, "");
      const aRange =
        ayahs.length > 1
          ? `${primary.ayahNumber}-${ayahs[ayahs.length - 1].ayahNumber}`
          : `${primary.ayahNumber}`;
      const voiceTag =
        voiceMode === "none"
          ? "recitation"
          : voiceMode === "record"
            ? "uservoice"
            : "aivoice";
      const filename = `Istikhara_${safeSurah}_${primary.surahNumber}-${aRange}_${script}_${voiceTag}_9x16.mp4`;

      setExported({
        mp4Url: URL.createObjectURL(res.mp4Blob),
        mp4Blob: res.mp4Blob,
        coverUrl: URL.createObjectURL(res.coverBlob),
        srt: toSrt(previewTimeline.cues),
        vtt: toVtt(previewTimeline.cues),
        filename,
        durationSec: res.totalDurationSec,
      });

      if (isNative()) {
        await saveAndShareBlob({
          blob: res.mp4Blob,
          filename,
          kind: "video",
          openShareSheet: false,
        });
      }

      trackEvent({
        name: "video_exported",
        props: {
          preset: platform.id,
          lang: mode,
          duration: Math.round(res.totalDurationSec),
        },
      });
      await adService.showInterstitialAfterExport();
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
        const { export916Mp4 } = await import("@/lib/video/encode");
        const res = await export916Mp4({
          ayahs: parts[i].partAyahs,
          selectedTafseerParagraphs: parts[i].paras,
          options,
          reciter,
          extras: {
            mediaSource: mediaSourceRef.current,
            mediaDimensions,
            customHandImg: customHandImgRef.current,
            customHand,
          },
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
    ? `📖 سورۃ ${primaryAyah.surahNameAr} ${primaryAyah.surahNumber}:${primaryAyah.ayahNumber}\n${primaryAyah.urduText.slice(0, 120).trim()}…\n🎙 تلاوت: ${getReciterName(reciter, "ur")}${mode !== "urdu-tarjuma" ? `   📚 تفسیر: ${tafsirInfo.nameUr}` : ""}${voiceCreditUr ? `   🔊 ${voiceCreditUr}` : ""}\n🔗 ${shareUrl}\n#استخارہ #Istikhara #QuranVerse #قرآن #تفسیر #IslamicReels`
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

      <main className="flex-1 min-h-[85dvh] max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
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
          <GlassCard variant="glass-2" className="lg:col-span-5 p-4 flex flex-col items-center gap-4">
            <div
              className="relative w-[300px] h-[533px] sm:w-[330px] sm:h-[587px] rounded-xl overflow-hidden border border-[var(--border-subtle)]"
            >
              <canvas
                ref={canvasRef}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                className="w-full h-full block"
              />
              {loadingAyahs && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0A1A2F]/80 p-6">
                  <GlassSkeleton className="w-full h-48" />
                </div>
              )}
              {ayahError && !loadingAyahs && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0A1A2F]/90 p-6 text-center">
                  <p className="text-sm text-red-200">
                    {isUrdu ? "آیت لوڈ نہیں ہو سکی" : "Could not load verse"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryCount((c) => c + 1)}
                    className="px-4 py-2 rounded-xl bg-[var(--gold)] text-[#0A1A2F] text-xs font-semibold"
                  >
                    {isUrdu ? "دوبارہ کوشش کریں" : "Retry"}
                  </button>
                </div>
              )}
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
          </GlassCard>

          {/* Right/Bottom: Studio Controls */}
          <GlassCard variant="glass-2" className="lg:col-span-7 p-5 space-y-5">
            {/* Verse & Range Picker */}
            <VersePicker
              surahs={surahs}
              surah={surah}
              startAyah={startAyah}
              rangeCount={rangeCount}
              onChangeSurah={setSurah}
              onChangeStartAyah={setStartAyah}
              onChangeRange={setRangeCount}
            />

            <StudioControlsPanel
              isUrdu={isUrdu}
              isRtl={isUrdu}
              activeTab={studioTab}
              onChangeTab={setStudioTab}
              templateId={templateId}
              onApplyTemplate={applyTemplate}
              onResetTemplate={() => applyTemplate(activeTpl)}
              bgCategory={bgCategory}
              setBgCategory={setBgCategory}
              bgStyle={bgStyle}
              setBgStyle={setBgStyle}
              theme={theme}
              setTheme={setTheme}
              paperStyle={paperStyle}
              setPaperStyle={setPaperStyle}
              solidConfig={solidConfig}
              setSolidConfig={setSolidConfig}
              gradientConfig={gradientConfig}
              setGradientConfig={setGradientConfig}
              mediaConfig={mediaConfig}
              setMediaConfig={setMediaConfig}
              onLoadMediaSource={loadMediaSource}
              motionIntensity={motionIntensity}
              setMotionIntensity={setMotionIntensity}
              audioReactiveGlow={audioReactiveGlow}
              setAudioReactiveGlow={setAudioReactiveGlow}
              particles={particles}
              setParticles={setParticles}
              script={script}
              setScript={setScript}
              arabicFont={arabicFont}
              setArabicFont={setArabicFont}
              urduFont={urduFont}
              setUrduFont={setUrduFont}
              arabicMaxSize={arabicMaxSize}
              setArabicMaxSize={setArabicMaxSize}
              urduMaxSize={urduMaxSize}
              setUrduMaxSize={setUrduMaxSize}
              languageDisplay={languageDisplay}
              setLanguageDisplay={setLanguageDisplay}
              wordByWordMeaning={wordByWordMeaning}
              setWordByWordMeaning={setWordByWordMeaning}
              captionStyle={captionStyle}
              setCaptionStyle={setCaptionStyle}
              showReference={showReference}
              setShowReference={setShowReference}
              mode={mode}
              setMode={setMode}
              tafsirSlug={tafsirSlug}
              setTafsirSlug={setTafsirSlug}
              tafseerParagraphs={tafseerParagraphs}
              selectedIndices={selectedIndices}
              setSelectedIndices={setSelectedIndices}
              tafseerMissing={tafseerMissing}
              handStyle={handStyle}
              setHandStyle={setHandStyle}
              handAsset={handAsset}
              setHandAsset={setHandAsset}
              handRenderStyle={handRenderStyle}
              setHandRenderStyle={setHandRenderStyle}
              handSkinTone={handSkinTone}
              setHandSkinTone={setHandSkinTone}
              handSleeveColor={handSleeveColor}
              setHandSleeveColor={setHandSleeveColor}
              handScale={handScale}
              setHandScale={setHandScale}
              customHand={customHand}
              onUpdateCustomHand={setCustomHand}
              reciter={reciter}
              setReciter={setReciter}
              approximateSync={ayahWordData.some((d) => !d.entry)}
              voiceMode={voiceMode}
              setVoiceMode={setVoiceMode}
              voiceId={voiceId}
              setVoiceId={setVoiceId}
              voiceRate={voiceRate}
              setVoiceRate={setVoiceRate}
              userVoiceName={userVoiceName}
              setUserVoiceName={setUserVoiceName}
              voicePromptText={voicePromptText}
              onRecordedVoice={setRecordedVoice}
              tafseerAudio={tafseerAudio}
              setTafseerAudio={setTafseerAudio}
              platformId={platformId}
              setPlatformId={setPlatformId}
              showQr={showQr}
              setShowQr={setShowQr}
              showHookCard={showHookCard}
              setShowHookCard={setShowHookCard}
              hookText={hookText}
              setHookText={setHookText}
              showProgressBar={showProgressBar}
              setShowProgressBar={setShowProgressBar}
              transition={transition}
              setTransition={setTransition}
              showEndScreen={showEndScreen}
              setShowEndScreen={setShowEndScreen}
              loopFriendly={loopFriendly}
              setLoopFriendly={setLoopFriendly}
              filenamePreview={
                primaryAyah
                  ? `Istikhara_${primaryAyah.surahNumber}-${primaryAyah.ayahNumber}_${script}_9x16.mp4`
                  : "Istikhara_9x16.mp4"
              }
              onSaveStylePreset={handleSaveStylePreset}
              savedPresets={savedPresets}
              onLoadStylePreset={handleLoadStylePreset}
            />

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

                {!isNative() && (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center space-y-2">
                    <p className="text-xs text-[var(--text-secondary)]">
                      {isUrdu
                        ? "ہماری ایپ میں ویڈیوز براہِ راست گیلری میں محفوظ کریں:"
                        : "Save to gallery easily in our app:"}
                    </p>
                    <StoreBadges placement="post_export" />
                  </div>
                )}

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
          </GlassCard>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
