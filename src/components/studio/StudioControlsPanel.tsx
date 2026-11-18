import { useEffect, useState } from "react";
import { Check, Download, Film, RefreshCw, Save, Search, Trash2, Upload } from "lucide-react";
import { GlassButton, GlassCard, GlassChip, GlassInput, GlassSegmented, GlassSlider, LiquidGlassTabs } from "@/components/glass";
import {
  ARABIC_QURAN_FONTS,
  URDU_FONTS,
  getDefaultArabicFont,
  type ArabicFontId,
  type QuranScript,
  type UrduFontId,
} from "@/config/fonts";
import { RECITERS, type ReciterId } from "@/config/reciters";
import { PLATFORMS_916, type Platform916Id } from "@/config/platforms916";
import { URDU_TAFSIRS } from "@/config/tafsirs";
import type { TafseerParagraph } from "@/lib/tafseer";
import {
  DEFAULT_VOICE_ID,
  URDU_VOICES,
  VOICE_RATE_MAX,
  VOICE_RATE_MIN,
  type VoiceMode,
} from "@/config/voices";
import { HOOK_PRESETS } from "@/content/hooks";
import { SHORTS_TEMPLATES, type CaptionStyle, type PageTransition, type ShortsTemplate, type TemplateId } from "@/config/templates";
import {
  GRADIENT_PRESETS,
  LAYERED_DESIGNS,
  SOLID_SWATCHES,
  type BgCategory,
  type BgStyle,
  type GradientBgConfig,
  type LayeredDesignId,
  type MediaBgConfig,
  type MotionIntensity,
  type PaperStyle,
  type SolidBgConfig,
  type VideoTheme,
} from "@/lib/video/backgrounds";
import type {
  CustomHandConfig,
  HandAssetId,
  HandRenderStyle,
  HandSkinTone,
  HandStyleMode,
} from "@/lib/video/handAssets";
import type { TafseerAudioMode, TextLanguageDisplay, VideoMode } from "@/lib/video/timeline";
import {
  deleteRecentMediaBg,
  listRecentMediaBgs,
  saveRecentMediaBg,
  type RecentMediaBg,
} from "@/lib/video/mediaBg";
import { VoiceRecorder } from "./VoiceRecorder";

export type StudioTabId = "template" | "background" | "text" | "hand" | "audio" | "export";

export interface StudioControlsProps {
  isUrdu: boolean;
  isRtl: boolean;
  activeTab: StudioTabId;
  onChangeTab: (t: StudioTabId) => void;
  templateId: TemplateId;
  onApplyTemplate: (tpl: ShortsTemplate) => void;
  onResetTemplate: () => void;
  // Background
  bgCategory: BgCategory;
  setBgCategory: (c: BgCategory) => void;
  bgStyle: BgStyle;
  setBgStyle: (s: BgStyle) => void;
  layeredDesign: LayeredDesignId;
  setLayeredDesign: (l: LayeredDesignId) => void;
  theme: VideoTheme;
  setTheme: (t: VideoTheme) => void;
  paperStyle: PaperStyle;
  setPaperStyle: (p: PaperStyle) => void;
  solidConfig: SolidBgConfig;
  setSolidConfig: (c: SolidBgConfig) => void;
  gradientConfig: GradientBgConfig;
  setGradientConfig: (g: GradientBgConfig) => void;
  mediaConfig: MediaBgConfig;
  setMediaConfig: (m: MediaBgConfig) => void;
  onLoadMediaSource: (blob: Blob | string, kind: "image" | "video", credit?: string) => void;
  motionIntensity: MotionIntensity;
  setMotionIntensity: (m: MotionIntensity) => void;
  audioReactiveGlow: boolean;
  setAudioReactiveGlow: (b: boolean) => void;
  particles: boolean;
  setParticles: (b: boolean) => void;
  // Text
  script: QuranScript;
  setScript: (s: QuranScript) => void;
  arabicFont: ArabicFontId;
  setArabicFont: (f: ArabicFontId) => void;
  urduFont: UrduFontId;
  setUrduFont: (f: UrduFontId) => void;
  arabicMaxSize: number;
  setArabicMaxSize: (n: number) => void;
  urduMaxSize: number;
  setUrduMaxSize: (n: number) => void;
  languageDisplay: TextLanguageDisplay;
  setLanguageDisplay: (l: TextLanguageDisplay) => void;
  wordByWordMeaning: boolean;
  setWordByWordMeaning: (b: boolean) => void;
  captionStyle: CaptionStyle;
  setCaptionStyle: (c: CaptionStyle) => void;
  showReference: boolean;
  setShowReference: (b: boolean) => void;
  mode: VideoMode;
  setMode: (m: VideoMode) => void;
  tafsirSlug: string;
  setTafsirSlug: (s: string) => void;
  tafseerParagraphs: TafseerParagraph[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  tafseerMissing: boolean;
  // Hand
  handStyle: HandStyleMode;
  setHandStyle: (h: HandStyleMode) => void;
  handAsset: HandAssetId;
  setHandAsset: (a: HandAssetId) => void;
  handRenderStyle: HandRenderStyle;
  setHandRenderStyle: (r: HandRenderStyle) => void;
  handSkinTone: HandSkinTone;
  setHandSkinTone: (s: HandSkinTone) => void;
  handSleeveColor: string;
  setHandSleeveColor: (c: string) => void;
  handScale: number;
  setHandScale: (n: number) => void;
  customHand: CustomHandConfig | null;
  onUpdateCustomHand: (c: CustomHandConfig | null) => void;
  // Audio
  reciter: ReciterId;
  setReciter: (r: ReciterId) => void;
  approximateSync: boolean;
  voiceMode: VoiceMode;
  setVoiceMode: (v: VoiceMode) => void;
  voiceId: string;
  setVoiceId: (v: string) => void;
  voiceRate: number;
  setVoiceRate: (n: number) => void;
  userVoiceName: string;
  setUserVoiceName: (s: string) => void;
  voicePromptText: string;
  onRecordedVoice: (d: {
    blob: Blob;
    url: string;
    durationSec: number;
    trimStartSec: number;
    trimEndSec: number;
  } | null) => void;
  tafseerAudio: TafseerAudioMode;
  setTafseerAudio: (t: TafseerAudioMode) => void;
  // Export & Engagement
  platformId: Platform916Id;
  setPlatformId: (p: Platform916Id) => void;
  showQr: boolean;
  setShowQr: (b: boolean) => void;
  showHookCard: boolean;
  setShowHookCard: (b: boolean) => void;
  hookText: string;
  setHookText: (s: string) => void;
  showProgressBar: boolean;
  setShowProgressBar: (b: boolean) => void;
  transition: PageTransition;
  setTransition: (t: PageTransition) => void;
  showEndScreen: boolean;
  setShowEndScreen: (b: boolean) => void;
  loopFriendly: boolean;
  setLoopFriendly: (b: boolean) => void;
  filenamePreview: string;
  onSaveStylePreset: (name: string) => void;
  savedPresets: Array<{ name: string }>;
  onLoadStylePreset: (name: string) => void;
}

export function StudioControlsPanel(p: StudioControlsProps) {
  const [recentMedia, setRecentMedia] = useState<RecentMediaBg[]>([]);
  const [stockQuery, setStockQuery] = useState("calm night sky");
  const [stockResults, setStockResults] = useState<
    Array<{ id: number; photographer: string; thumbUrl: string; portraitUrl: string }>
  >([]);
  const [stockAvailable, setStockAvailable] = useState<boolean | null>(null);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    if (p.activeTab === "background" && p.bgCategory === "media") {
      listRecentMediaBgs().then(setRecentMedia);
    }
  }, [p.activeTab, p.bgCategory]);

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const item: RecentMediaBg = {
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      kind: isVideo ? "video" : "image",
      dataUrlOrBlob: file,
      createdAt: Date.now(),
    };
    await saveRecentMediaBg(item);
    setRecentMedia(await listRecentMediaBgs());
    p.onLoadMediaSource(file, item.kind);
  };

  const searchStock = async (q: string) => {
    try {
      const res = await fetch(`/api/stock?q=${encodeURIComponent(q)}`);
      if (res.status === 503) {
        setStockAvailable(false);
        return;
      }
      const data = (await res.json()) as {
        available: boolean;
        photos: Array<{ id: number; photographer: string; thumbUrl: string; portraitUrl: string }>;
      };
      setStockAvailable(data.available);
      setStockResults(data.photos || []);
    } catch {
      setStockAvailable(false);
    }
  };

  const handleUploadHand = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        p.onUpdateCustomHand({
          dataUrl: reader.result,
          tipX: 0.25,
          tipY: 0.12,
          scale: 1,
          rotationDeg: 0,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "template", label: p.isUrdu ? "ٹیمپلیٹ" : "Template" },
    { id: "background", label: p.isUrdu ? "پس منظر" : "Background" },
    { id: "text", label: p.isUrdu ? "متن" : "Text" },
    { id: "hand", label: p.isUrdu ? "ہاتھ" : "Hand" },
    { id: "audio", label: p.isUrdu ? "آواز" : "Audio" },
    { id: "export", label: p.isUrdu ? "ایکسپورٹ" : "Export" },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <LiquidGlassTabs
          items={tabs}
          value={p.activeTab}
          onChange={(id) => p.onChangeTab(id as StudioTabId)}
          isRtl={p.isRtl}
          compact
          ariaLabel="Studio sections"
        />
      </div>

      {/* 1. TEMPLATE TAB */}
      {p.activeTab === "template" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SHORTS_TEMPLATES.map((tpl) => {
              const active = tpl.id === p.templateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => p.onApplyTemplate(tpl)}
                  className={`group text-start rounded-2xl p-2.5 glass-border-mask transition-all cursor-pointer ${
                    active ? "glass-3 ring-2 ring-[#C9A227]" : "glass-1 hover:opacity-95"
                  }`}
                >
                  <div
                    className="h-24 rounded-xl mb-2 flex items-center justify-center border border-white/10 overflow-hidden"
                    style={{ background: tpl.previewGradient }}
                  >
                    <span
                      className={`text-sm font-arabic-quran ${
                        tpl.theme === "ivory" ? "text-[#1B1B1B]" : "text-[#F7F1E3]"
                      }`}
                    >
                      بِسْمِ ٱللَّهِ
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--accent-gold)] truncate">
                    {p.isUrdu ? tpl.nameUr : tpl.nameEn}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">
                    {p.isUrdu ? tpl.descUr : tpl.descEn}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <GlassButton variant="secondary" onClick={p.onResetTemplate} className="text-xs px-3 py-1.5">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              {p.isUrdu ? "ٹیمپلیٹ ری سیٹ" : "Reset to template"}
            </GlassButton>
            <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
              <GlassInput
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder={p.isUrdu ? "میرا اسٹائل نام…" : "My style name…"}
                className="py-1.5 text-xs"
              />
              <GlassButton
                variant="secondary"
                onClick={() => {
                  if (presetName.trim()) {
                    p.onSaveStylePreset(presetName.trim());
                    setPresetName("");
                  }
                }}
                className="text-xs px-3 py-1.5 shrink-0"
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                Save
              </GlassButton>
            </div>
          </div>
          {p.savedPresets.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.savedPresets.map((sp) => (
                <GlassChip key={sp.name} onClick={() => p.onLoadStylePreset(sp.name)}>
                  {sp.name}
                </GlassChip>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. BACKGROUND TAB */}
      {p.activeTab === "background" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "layered", label: p.isUrdu ? "لیئرڈ (10)" : "Layered (10)" },
                  { id: "solid", label: p.isUrdu ? "یک رنگی" : "Solid" },
                  { id: "gradient", label: p.isUrdu ? "گریڈینٹ" : "Gradient" },
                  { id: "geometric", label: p.isUrdu ? "جیومیٹرک" : "Geometric" },
                  { id: "paper", label: p.isUrdu ? "کاغذ / بورڈ" : "Paper" },
                  { id: "media", label: p.isUrdu ? "میری تصویر/ویڈیو" : "Photo/Video" },
                  { id: "stock", label: p.isUrdu ? "اسٹاک فوٹو" : "Stock" },
                ] as Array<{ id: BgCategory; label: string }>
              ).map((c) => (
                <GlassChip
                  key={c.id}
                  selected={p.bgCategory === c.id}
                  onClick={() => p.setBgCategory(c.id)}
                >
                  {c.label}
                </GlassChip>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
              <Check className="w-3 h-3" aria-hidden="true" />
              contrast OK
            </span>
          </div>

          {p.bgCategory === "layered" && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {LAYERED_DESIGNS.map((d) => {
                const active = p.layeredDesign === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      p.setLayeredDesign(d.id);
                      p.setTheme(d.isLight ? "ivory" : "midnight_gold");
                    }}
                    className={`text-start rounded-xl p-1.5 glass-border-mask transition-all cursor-pointer ${
                      active ? "glass-3 ring-2 ring-[#C9A227]" : "glass-1 hover:opacity-95"
                    }`}
                  >
                    <div
                      className="relative h-20 rounded-lg overflow-hidden mb-1.5 border border-white/10"
                      style={{ background: d.base }}
                    >
                      <div
                        className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl rotate-45 opacity-75"
                        style={{ background: d.shapes[0] }}
                      />
                      <div
                        className="absolute top-3 right-0 w-14 h-14 rounded-2xl rotate-45 opacity-70"
                        style={{ background: d.shapes[2] }}
                      />
                      <div
                        className="absolute -bottom-5 left-3 w-16 h-16 rounded-2xl rotate-45 opacity-75"
                        style={{ background: d.shapes[1] }}
                      />
                    </div>
                    <p className="text-[11px] font-medium truncate">
                      {p.isUrdu ? d.labelUr : d.labelEn}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {p.bgCategory === "solid" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {SOLID_SWATCHES.map((sw) => (
                  <button
                    key={sw.id}
                    type="button"
                    title={sw.label}
                    onClick={() => p.setSolidConfig({ ...p.solidConfig, color: sw.color })}
                    className={`w-9 h-9 rounded-full border-2 cursor-pointer ${
                      p.solidConfig.color === sw.color ? "border-[#E6CF7A] scale-110" : "border-white/25"
                    }`}
                    style={{ background: sw.color }}
                  />
                ))}
                <input
                  type="color"
                  aria-label="Custom solid colour"
                  value={p.solidConfig.color}
                  onChange={(e) => p.setSolidConfig({ ...p.solidConfig, color: e.target.value })}
                  className="w-9 h-9 rounded-full overflow-hidden cursor-pointer"
                />
              </div>
              <label className="block text-xs space-y-1">
                <span>Paper grain ({p.solidConfig.grainPct}%)</span>
                <GlassSlider
                  min={0}
                  max={6}
                  value={p.solidConfig.grainPct}
                  onChange={(n) => p.setSolidConfig({ ...p.solidConfig, grainPct: n })}
                  ariaLabel="Paper grain"
                />
              </label>
            </div>
          )}

          {p.bgCategory === "gradient" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((gp) => (
                  <button
                    key={gp.id}
                    type="button"
                    onClick={() =>
                      p.setGradientConfig({
                        ...p.gradientConfig,
                        stops: gp.stops,
                        angleDeg: gp.angleDeg,
                      })
                    }
                    className="h-14 rounded-xl border border-white/20 text-[11px] font-medium text-white shadow cursor-pointer"
                    style={{
                      background: `linear-gradient(${gp.angleDeg}deg, ${gp.stops.join(", ")})`,
                    }}
                  >
                    {gp.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span>Angle ({p.gradientConfig.angleDeg}°)</span>
                  <GlassSlider
                    min={0}
                    max={360}
                    value={p.gradientConfig.angleDeg}
                    onChange={(n) => p.setGradientConfig({ ...p.gradientConfig, angleDeg: n })}
                    ariaLabel="Gradient angle"
                  />
                </label>
                <label className="inline-flex items-center gap-2 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.gradientConfig.drift}
                    onChange={(e) =>
                      p.setGradientConfig({ ...p.gradientConfig, drift: e.target.checked })
                    }
                  />
                  <span>Slow animated drift</span>
                </label>
              </div>
            </div>
          )}

          {p.bgCategory === "geometric" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span>Pattern Style</span>
                <select
                  value={p.bgStyle}
                  onChange={(e) => p.setBgStyle(e.target.value as BgStyle)}
                  className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
                >
                  <option value="girih">Girih Star Lattice</option>
                  <option value="rosette">Rosette Mandala</option>
                  <option value="hexagonal">Hexagonal Arabesque</option>
                  <option value="mihrab">Mihrab Arch</option>
                  <option value="night_dome">Night Dome</option>
                </select>
              </label>
              <label className="space-y-1">
                <span>Theme</span>
                <select
                  value={p.theme}
                  onChange={(e) => p.setTheme(e.target.value as VideoTheme)}
                  className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
                >
                  <option value="midnight_gold">Midnight Gold</option>
                  <option value="emerald">Emerald</option>
                  <option value="ivory">Ivory</option>
                  <option value="royal_blue">Royal Blue</option>
                </select>
              </label>
            </div>
          )}

          {p.bgCategory === "paper" && (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "whiteboard", label: "Whiteboard" },
                  { id: "parchment", label: "Parchment" },
                  { id: "kraft", label: "Kraft Paper" },
                  { id: "chalkboard", label: "Chalkboard" },
                  { id: "lined_notebook", label: "Lined Notebook" },
                ] as Array<{ id: PaperStyle; label: string }>
              ).map((ps) => (
                <GlassChip
                  key={ps.id}
                  selected={p.paperStyle === ps.id}
                  onClick={() => p.setPaperStyle(ps.id)}
                >
                  {ps.label}
                </GlassChip>
              ))}
            </div>
          )}

          {p.bgCategory === "media" && (
            <div className="space-y-3 text-xs">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-1 glass-border-mask cursor-pointer">
                <Upload className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
                <span>Upload JPG / PNG / WebP / MP4</span>
                <input
                  type="file"
                  accept="image/*,video/mp4,video/quicktime"
                  onChange={handleUploadMedia}
                  className="hidden"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span>Blur ({p.mediaConfig.blurPx}px)</span>
                  <GlassSlider
                    min={0}
                    max={30}
                    value={p.mediaConfig.blurPx}
                    onChange={(n) => p.setMediaConfig({ ...p.mediaConfig, blurPx: n })}
                    ariaLabel="Blur"
                  />
                </label>
                <label className="space-y-1">
                  <span>Darken ({p.mediaConfig.darkenPct}%)</span>
                  <GlassSlider
                    min={0}
                    max={80}
                    value={p.mediaConfig.darkenPct}
                    onChange={(n) => p.setMediaConfig({ ...p.mediaConfig, darkenPct: n })}
                    ariaLabel="Darken"
                  />
                </label>
              </div>
              {recentMedia.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[var(--text-muted)]">Recent backgrounds</span>
                  <div className="flex flex-wrap gap-2">
                    {recentMedia.map((rm) => (
                      <div key={rm.id} className="inline-flex items-center gap-1 rounded-xl glass-1 px-2.5 py-1">
                        <button
                          type="button"
                          onClick={() => p.onLoadMediaSource(rm.dataUrlOrBlob, rm.kind)}
                          className="truncate max-w-[110px]"
                        >
                          {rm.name}
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={async () => {
                            await deleteRecentMediaBg(rm.id);
                            setRecentMedia(await listRecentMediaBgs());
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-red-300" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {p.bgCategory === "stock" && (
            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <GlassInput
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                  placeholder="sky, clouds, mosque, desert…"
                />
                <GlassButton variant="secondary" onClick={() => searchStock(stockQuery)}>
                  <Search className="w-3.5 h-3.5" aria-hidden="true" />
                </GlassButton>
              </div>
              {stockAvailable === false && (
                <p className="text-[var(--text-muted)]">
                  Stock photos require PEXELS_API_KEY in server environment.
                </p>
              )}
              {stockResults.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {stockResults.map((ph) => (
                    <button
                      key={ph.id}
                      type="button"
                      onClick={() =>
                        p.onLoadMediaSource(ph.portraitUrl, "image", ph.photographer)
                      }
                      className="rounded-lg overflow-hidden border border-white/20 h-20 cursor-pointer"
                    >
                      <img src={ph.thumbUrl} alt={ph.photographer} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. TEXT TAB */}
      {p.activeTab === "text" && (
        <div className="space-y-4">
          <GlassSegmented
            isRtl={p.isRtl}
            value={p.mode}
            onChange={(id) => p.setMode(id as VideoMode)}
            ariaLabel="Video Mode"
            items={[
              { id: "urdu-tarjuma", label: "اردو ترجمہ" },
              { id: "urdu-tafseer", label: "اردو تفسیر" },
              { id: "tafseer-only", label: "صرف تفسیر" },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="space-y-1">
              <span>رسم الخط / Script</span>
              <select
                value={p.script}
                onChange={(e) => {
                  const next = e.target.value as QuranScript;
                  p.setScript(next);
                  p.setArabicFont(getDefaultArabicFont(next));
                }}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
              >
                <option value="indopak">انڈو پاک (IndoPak)</option>
                <option value="madani">مدنی / عثمانی (Madani)</option>
              </select>
            </label>
            <label className="space-y-1">
              <span>عربی فونٹ / Arabic Font</span>
              <select
                value={p.arabicFont}
                onChange={(e) => p.setArabicFont(e.target.value as ArabicFontId)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
              >
                {Object.values(ARABIC_QURAN_FONTS)
                  .filter((f) => !f.script || f.script === p.script)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {p.isUrdu ? f.labelUr : f.labelEn}
                    </option>
                  ))}
              </select>
            </label>
            <label className="space-y-1">
              <span>اردو فونٹ / Urdu Font</span>
              <select
                value={p.urduFont}
                onChange={(e) => p.setUrduFont(e.target.value as UrduFontId)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
              >
                {Object.values(URDU_FONTS).map((f) => (
                  <option key={f.id} value={f.id}>
                    {p.isUrdu ? f.labelUr : f.labelEn}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span>عربی سائز ({p.arabicMaxSize}px)</span>
              <GlassSlider
                min={40}
                max={64}
                value={p.arabicMaxSize}
                onChange={p.setArabicMaxSize}
                ariaLabel="Arabic size"
              />
            </label>
            <label className="space-y-1">
              <span>اردو سائز ({p.urduMaxSize}px)</span>
              <GlassSlider
                min={32}
                max={42}
                value={p.urduMaxSize}
                onChange={p.setUrduMaxSize}
                ariaLabel="Urdu size"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span>Caption Style</span>
              <select
                value={p.captionStyle}
                onChange={(e) => p.setCaptionStyle(e.target.value as CaptionStyle)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
              >
                <option value="boxed">Boxed Panel</option>
                <option value="clean">Clean</option>
                <option value="outline">Outline</option>
                <option value="handwritten">Handwritten (Gulzar)</option>
                <option value="spoken_highlight">Spoken Highlight</option>
              </select>
            </label>
            <label className="space-y-1">
              <span>Languages</span>
              <select
                value={p.languageDisplay}
                onChange={(e) => p.setLanguageDisplay(e.target.value as TextLanguageDisplay)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
              >
                <option value="ar_ur">Arabic + Urdu</option>
                <option value="ar_en">Arabic + English</option>
                <option value="ar_both">Arabic + Urdu + English</option>
                <option value="ar_only">Arabic Only</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={p.wordByWordMeaning}
                onChange={(e) => p.setWordByWordMeaning(e.target.checked)}
              />
              <span>لفظی ترجمہ / Word meanings</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={p.showReference}
                onChange={(e) => p.setShowReference(e.target.checked)}
              />
              <span>Surah Reference</span>
            </label>
          </div>

          {p.mode !== "urdu-tarjuma" && (
            <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs">
              <select
                value={p.tafsirSlug}
                onChange={(e) => p.setTafsirSlug(e.target.value)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
              >
                {URDU_TAFSIRS.map((tf) => (
                  <option key={tf.slug} value={tf.slug}>
                    {tf.nameUr} — {tf.authorUr}
                  </option>
                ))}
              </select>
              {p.tafseerMissing ? (
                <p className="text-amber-300">اس آیت کی اردو تفسیر دستیاب نہیں۔</p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {p.tafseerParagraphs.map((para) => (
                    <label
                      key={para.index}
                      className="flex items-start gap-2 rounded-xl glass-1 p-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={p.selectedIndices.includes(para.index)}
                        onChange={() =>
                          p.setSelectedIndices((prev) =>
                            prev.includes(para.index)
                              ? prev.filter((i) => i !== para.index)
                              : [...prev, para.index]
                          )
                        }
                      />
                      <span className="font-urdu-nastaliq leading-loose line-clamp-2">
                        {para.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. HAND TAB */}
      {p.activeTab === "hand" && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span>ہاتھ کا انداز / Hand Style</span>
              <select
                value={p.handStyle}
                onChange={(e) => p.setHandStyle(e.target.value as HandStyleMode)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
              >
                <option value="doodle_write">✍ Doodle Write</option>
                <option value="qalam_write">✒ Qalam Write</option>
                <option value="finger_pointer">☝ Finger Pointer</option>
                <option value="highlight_only">✨ Highlight only</option>
                <option value="off">Off</option>
              </select>
            </label>
            <label className="space-y-1">
              <span>Hand Asset</span>
              <select
                value={p.handAsset}
                onChange={(e) => p.setHandAsset(e.target.value as HandAssetId)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
              >
                <option value="marker">Marker Hand</option>
                <option value="qalam">Qalam Hand</option>
                <option value="ink_pen">Ink Pen Hand</option>
                <option value="finger">Pointing Finger</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label className="space-y-1">
              <span>Style</span>
              <select
                value={p.handRenderStyle}
                onChange={(e) => p.setHandRenderStyle(e.target.value as HandRenderStyle)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
              >
                <option value="illustrated">Illustrated</option>
                <option value="line_art">Line-Art</option>
              </select>
            </label>
            <label className="space-y-1">
              <span>Skin Tone</span>
              <select
                value={p.handSkinTone}
                onChange={(e) => p.setHandSkinTone(e.target.value as HandSkinTone)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="deep">Deep</option>
              </select>
            </label>
            <label className="space-y-1">
              <span>Sleeve Colour</span>
              <input
                type="color"
                value={p.handSleeveColor}
                onChange={(e) => p.setHandSleeveColor(e.target.value)}
                className="w-full h-9 rounded-xl overflow-hidden cursor-pointer"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span>Hand Size ({p.handScale.toFixed(2)}x)</span>
            <GlassSlider
              min={0.6}
              max={1.5}
              step={0.05}
              value={p.handScale}
              onChange={p.setHandScale}
              ariaLabel="Hand scale"
            />
          </label>

          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass-1 glass-border-mask cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
                <span>Upload my hand (PNG)</span>
                <input type="file" accept="image/png,image/webp" onChange={handleUploadHand} className="hidden" />
              </label>
              {p.customHand && (
                <button
                  type="button"
                  onClick={() => p.onUpdateCustomHand(null)}
                  className="text-red-300 underline"
                >
                  Remove custom hand
                </button>
              )}
            </div>
            {p.customHand && (
              <div className="grid grid-cols-2 gap-2">
                <label>
                  Tip X ({p.customHand.tipX.toFixed(2)})
                  <GlassSlider
                    min={0}
                    max={1}
                    step={0.02}
                    value={p.customHand.tipX}
                    onChange={(v) => p.onUpdateCustomHand({ ...p.customHand!, tipX: v })}
                    ariaLabel="Hand tip X"
                  />
                </label>
                <label>
                  Tip Y ({p.customHand.tipY.toFixed(2)})
                  <GlassSlider
                    min={0}
                    max={1}
                    step={0.02}
                    value={p.customHand.tipY}
                    onChange={(v) => p.onUpdateCustomHand({ ...p.customHand!, tipY: v })}
                    ariaLabel="Hand tip Y"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. AUDIO TAB */}
      {p.activeTab === "audio" && (
        <div className="space-y-4 text-xs">
          <label className="block space-y-1">
            <span>قاری / Reciter</span>
            <select
              value={p.reciter}
              onChange={(e) => p.setReciter(e.target.value as ReciterId)}
              className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {p.isUrdu ? r.nameUr : r.nameEn} {r.wordTimed ? "✓ لفظ بہ لفظ" : ""}
                </option>
              ))}
            </select>
            {p.approximateSync && (
              <span className="block text-amber-300">اندازاً ہم آہنگی / approximate sync</span>
            )}
          </label>

          <div className="space-y-2">
            <span>آواز (اردو وائس اوور) / Urdu Voiceover</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: "none", label: "صرف تلاوت" },
                  { id: "ai-translation", label: "AI ترجمہ" },
                  { id: "ai-tafseer", label: "AI تفسیر" },
                  { id: "record", label: "میری آواز" },
                ] as Array<{ id: VoiceMode; label: string }>
              ).map((vm) => (
                <GlassChip
                  key={vm.id}
                  selected={p.voiceMode === vm.id}
                  onClick={() => p.setVoiceMode(vm.id)}
                >
                  {vm.label}
                </GlassChip>
              ))}
            </div>

            {(p.voiceMode === "ai-translation" || p.voiceMode === "ai-tafseer") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <select
                  value={p.voiceId || DEFAULT_VOICE_ID}
                  onChange={(e) => p.setVoiceId(e.target.value)}
                  className="rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2"
                >
                  {URDU_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {p.isUrdu ? v.labelUr : v.labelEn}
                    </option>
                  ))}
                </select>
                <label className="space-y-1">
                  <span>Speed ({p.voiceRate.toFixed(2)}x)</span>
                  <GlassSlider
                    min={VOICE_RATE_MIN}
                    max={VOICE_RATE_MAX}
                    step={0.05}
                    value={p.voiceRate}
                    onChange={p.setVoiceRate}
                    ariaLabel="Voice rate"
                  />
                </label>
              </div>
            )}

            {p.voiceMode === "record" && (
              <div className="space-y-2 pt-1">
                <GlassInput
                  value={p.userVoiceName}
                  onChange={(e) => p.setUserVoiceName(e.target.value)}
                  placeholder={p.isUrdu ? "آپ کا نام (کریڈٹ کے لیے)" : "Your name (optional credit)"}
                />
                <VoiceRecorder
                  promptText={p.voicePromptText}
                  isUrdu={p.isUrdu}
                  onRecorded={p.onRecordedVoice}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. EXPORT & ENGAGEMENT TAB */}
      {p.activeTab === "export" && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span>Platform Safe-Zone</span>
              <select
                value={p.platformId}
                onChange={(e) => p.setPlatformId(e.target.value as Platform916Id)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
              >
                {PLATFORMS_916.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {p.isUrdu ? pl.labelUr : pl.labelEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span>Page Transition</span>
              <select
                value={p.transition}
                onChange={(e) => p.setTransition(e.target.value as PageTransition)}
                className="w-full rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-2 text-sm"
              >
                <option value="fade">Fade</option>
                <option value="slide_up">Slide Up</option>
                <option value="ink_wipe">Ink Wipe</option>
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={p.showHookCard}
                onChange={(e) => p.setShowHookCard(e.target.checked)}
              />
              <span>Hook Card (first 1.5s)</span>
            </label>
            {p.showHookCard && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {HOOK_PRESETS.map((hp) => (
                    <GlassChip
                      key={hp.id}
                      selected={p.hookText === (p.isUrdu ? hp.ur : hp.en)}
                      onClick={() => p.setHookText(p.isUrdu ? hp.ur : hp.en)}
                    >
                      {p.isUrdu ? hp.ur : hp.en}
                    </GlassChip>
                  ))}
                </div>
                <GlassInput
                  value={p.hookText}
                  onChange={(e) => p.setHookText(e.target.value)}
                  placeholder="Custom hook title…"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={p.showProgressBar} onChange={(e) => p.setShowProgressBar(e.target.checked)} />
              <span>Progress Bar</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={p.showQr} onChange={(e) => p.setShowQr(e.target.checked)} />
              <span>QR Code</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={p.showEndScreen} onChange={(e) => p.setShowEndScreen(e.target.checked)} />
              <span>End Screen</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={p.loopFriendly} onChange={(e) => p.setLoopFriendly(e.target.checked)} />
              <span>Loop-friendly ending</span>
            </label>
          </div>

          <GlassCard variant="glass-1" className="p-3 text-[11px] text-[var(--text-muted)]" dir="ltr">
            File: {p.filenamePreview}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
