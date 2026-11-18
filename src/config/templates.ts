import type { ArabicFontId, QuranScript, UrduFontId } from "./fonts";
import type {
  BgCategory,
  BgStyle,
  GradientBgConfig,
  MediaBgConfig,
  PaperStyle,
  SolidBgConfig,
  VideoTheme,
} from "@/lib/video/backgrounds";
import type { HandAssetId, HandRenderStyle, HandStyleMode } from "@/lib/video/handAssets";

export type TemplateId =
  | "whiteboard_doodle"
  | "mushaf_page"
  | "cinematic_photo"
  | "geometric_night"
  | "minimal_solid"
  | "kinetic_focus"
  | "chalkboard_lesson";

export type CaptionStyle =
  | "clean"
  | "boxed"
  | "outline"
  | "handwritten"
  | "spoken_highlight";

export type PageTransition = "fade" | "slide_up" | "ink_wipe";

export interface ShortsTemplate {
  id: TemplateId;
  nameUr: string;
  nameEn: string;
  descUr: string;
  descEn: string;
  previewGradient: string;
  bgCategory: BgCategory;
  bgStyle: BgStyle;
  paperStyle: PaperStyle;
  solidConfig: SolidBgConfig;
  gradientConfig: GradientBgConfig;
  mediaConfig: MediaBgConfig;
  theme: VideoTheme;
  script: QuranScript;
  arabicFont: ArabicFontId;
  urduFont: UrduFontId;
  handStyle: HandStyleMode;
  handAsset: HandAssetId;
  handRenderStyle: HandRenderStyle;
  captionStyle: CaptionStyle;
  transition: PageTransition;
  kineticSingleWord?: boolean;
  ornamentalBorder?: boolean;
  doodleBrackets?: boolean;
  chalkTexture?: boolean;
}

export const SHORTS_TEMPLATES: ShortsTemplate[] = [
  {
    id: "whiteboard_doodle",
    nameUr: "وائٹ بورڈ ڈوڈل",
    nameEn: "Whiteboard Doodle",
    descUr: "سفید بورڈ، مارکر ہاتھ سے عربی تحریر اور گلزار اردو ترجمہ",
    descEn: "Whiteboard paper, marker hand write-on, Gulzar Urdu & doodle brackets",
    previewGradient: "linear-gradient(145deg, #F8F9FB 0%, #E6EAF0 100%)",
    bgCategory: "paper",
    bgStyle: "girih",
    paperStyle: "whiteboard",
    solidConfig: { color: "#F8F9FB", grainPct: 2 },
    gradientConfig: { stops: ["#F8F9FB", "#E9EDF2"], type: "linear", angleDeg: 160, drift: false },
    mediaConfig: { blurPx: 8, darkenPct: 45, tintColor: "#0A1A2F", tintPct: 0, kenBurns: true, kenBurnsDir: "in", vignette: true, zoom: 1, offsetX: 0, offsetY: 0 },
    theme: "ivory",
    script: "indopak",
    arabicFont: "indopak-nastaleeq",
    urduFont: "gulzar",
    handStyle: "doodle_write",
    handAsset: "marker",
    handRenderStyle: "illustrated",
    captionStyle: "handwritten",
    transition: "ink_wipe",
    doodleBrackets: true,
  },
  {
    id: "mushaf_page",
    nameUr: "مصحفِ مبارک",
    nameEn: "Mushaf Page",
    descUr: "پُرانا کاغذ، نقش دار حاشیہ، قلم سے تحریر اور انڈو پاک خط",
    descEn: "Parchment paper, ornamental border, IndoPak script & qalam write-on",
    previewGradient: "linear-gradient(145deg, #F3EAD3 0%, #DECBA4 100%)",
    bgCategory: "paper",
    bgStyle: "mihrab",
    paperStyle: "parchment",
    solidConfig: { color: "#F3EAD3", grainPct: 3 },
    gradientConfig: { stops: ["#F3EAD3", "#DFCCA6"], type: "radial", angleDeg: 160, drift: false },
    mediaConfig: { blurPx: 8, darkenPct: 45, tintColor: "#0A1A2F", tintPct: 0, kenBurns: true, kenBurnsDir: "in", vignette: true, zoom: 1, offsetX: 0, offsetY: 0 },
    theme: "ivory",
    script: "indopak",
    arabicFont: "indopak-nastaleeq",
    urduFont: "noto-nastaliq",
    handStyle: "qalam_write",
    handAsset: "qalam",
    handRenderStyle: "line_art",
    captionStyle: "clean",
    transition: "fade",
    ornamentalBorder: true,
  },
  {
    id: "cinematic_photo",
    nameUr: "سینیما فوٹو",
    nameEn: "Cinematic Photo",
    descUr: "بلر بیک گراؤنڈ، روشن عربی متن اور کین برنز زوم",
    descEn: "Blurred darkened photo/sky, glowing ivory Arabic & finger pointer",
    previewGradient: "linear-gradient(145deg, #1E3A5F 0%, #0A1A2F 100%)",
    bgCategory: "gradient",
    bgStyle: "night_dome",
    paperStyle: "whiteboard",
    solidConfig: { color: "#0F2647", grainPct: 0 },
    gradientConfig: { stops: ["#092536", "#134B5F", "#247284"], type: "linear", angleDeg: 160, drift: true },
    mediaConfig: { blurPx: 8, darkenPct: 45, tintColor: "#0A1A2F", tintPct: 15, kenBurns: true, kenBurnsDir: "in", vignette: true, zoom: 1, offsetX: 0, offsetY: 0 },
    theme: "midnight_gold",
    script: "madani",
    arabicFont: "kfgqpc-hafs",
    urduFont: "noto-nastaliq",
    handStyle: "finger_pointer",
    handAsset: "finger",
    handRenderStyle: "line_art",
    captionStyle: "boxed",
    transition: "fade",
  },
  {
    id: "geometric_night",
    nameUr: "شبِ نور (جیومیٹرک)",
    nameEn: "Geometric Night",
    descUr: "روایتی اسلامی جیومیٹرک جال، سنہری روشنی اور تلاوت",
    descEn: "Midnight & emerald geometric star lattice with gold highlight sweep",
    previewGradient: "radial-gradient(circle, #0B3D2E 0%, #0A1A2F 100%)",
    bgCategory: "geometric",
    bgStyle: "girih",
    paperStyle: "whiteboard",
    solidConfig: { color: "#0A1A2F", grainPct: 0 },
    gradientConfig: { stops: ["#0A1A2F", "#0B3D2E"], type: "linear", angleDeg: 145, drift: true },
    mediaConfig: { blurPx: 8, darkenPct: 45, tintColor: "#0A1A2F", tintPct: 15, kenBurns: true, kenBurnsDir: "in", vignette: true, zoom: 1, offsetX: 0, offsetY: 0 },
    theme: "midnight_gold",
    script: "indopak",
    arabicFont: "indopak-nastaleeq",
    urduFont: "noto-nastaliq",
    handStyle: "finger_pointer",
    handAsset: "finger",
    handRenderStyle: "line_art",
    captionStyle: "boxed",
    transition: "fade",
  },
  {
    id: "minimal_solid",
    nameUr: "سادہ اور باوقار",
    nameEn: "Minimal Solid",
    descUr: "یک رنگی پس منظر، بڑا واضح عربی خط اور صاف کیپشنز",
    descEn: "Clean solid color, bold Arabic, highlight sweep & minimal captions",
    previewGradient: "linear-gradient(145deg, #0E1E4A 0%, #08122E 100%)",
    bgCategory: "solid",
    bgStyle: "girih",
    paperStyle: "whiteboard",
    solidConfig: { color: "#0E1E4A", grainPct: 1 },
    gradientConfig: { stops: ["#0E1E4A", "#08122E"], type: "linear", angleDeg: 160, drift: false },
    mediaConfig: { blurPx: 0, darkenPct: 0, tintColor: "#0E1E4A", tintPct: 0, kenBurns: false, kenBurnsDir: "in", vignette: false, zoom: 1, offsetX: 0, offsetY: 0 },
    theme: "royal_blue",
    script: "madani",
    arabicFont: "kfgqpc-hafs",
    urduFont: "gulzar",
    handStyle: "highlight_only",
    handAsset: "finger",
    handRenderStyle: "line_art",
    captionStyle: "clean",
    transition: "slide_up",
  },
  {
    id: "kinetic_focus",
    nameUr: "کائنیٹک لفظ بہ لفظ",
    nameEn: "Kinetic Focus",
    descUr: "ایک وقت میں ایک بڑا عربی لفظ، نیچے اردو معنی اور پھر مکمل آیت",
    descEn: "One large centered Arabic word at a time with Urdu meaning below",
    previewGradient: "linear-gradient(145deg, #14614A 0%, #061E16 100%)",
    bgCategory: "geometric",
    bgStyle: "rosette",
    paperStyle: "whiteboard",
    solidConfig: { color: "#061E16", grainPct: 0 },
    gradientConfig: { stops: ["#14614A", "#061E16"], type: "radial", angleDeg: 160, drift: true },
    mediaConfig: { blurPx: 8, darkenPct: 45, tintColor: "#061E16", tintPct: 20, kenBurns: true, kenBurnsDir: "in", vignette: true, zoom: 1, offsetX: 0, offsetY: 0 },
    theme: "emerald",
    script: "indopak",
    arabicFont: "indopak-nastaleeq",
    urduFont: "noto-nastaliq",
    handStyle: "finger_pointer",
    handAsset: "finger",
    handRenderStyle: "line_art",
    captionStyle: "spoken_highlight",
    transition: "fade",
    kineticSingleWord: true,
  },
  {
    id: "chalkboard_lesson",
    nameUr: "چاک بورڈ درس",
    nameEn: "Chalkboard Lesson",
    descUr: "گہرے سبز چاک بورڈ پر سفید اور زرد چاک سے تحریر",
    descEn: "Dark chalkboard surface with chalk-stroke write-on in white & yellow",
    previewGradient: "linear-gradient(145deg, #243830 0%, #15211C 100%)",
    bgCategory: "paper",
    bgStyle: "girih",
    paperStyle: "chalkboard",
    solidConfig: { color: "#1D2C26", grainPct: 4 },
    gradientConfig: { stops: ["#243830", "#15211C"], type: "linear", angleDeg: 160, drift: false },
    mediaConfig: { blurPx: 0, darkenPct: 0, tintColor: "#1D2C26", tintPct: 0, kenBurns: false, kenBurnsDir: "in", vignette: true, zoom: 1, offsetX: 0, offsetY: 0 },
    theme: "emerald",
    script: "indopak",
    arabicFont: "indopak-nastaleeq",
    urduFont: "gulzar",
    handStyle: "doodle_write",
    handAsset: "ink_pen",
    handRenderStyle: "line_art",
    captionStyle: "outline",
    transition: "ink_wipe",
    chalkTexture: true,
  },
];

export function getTemplateById(id: TemplateId): ShortsTemplate {
  return SHORTS_TEMPLATES.find((t) => t.id === id) ?? SHORTS_TEMPLATES[3];
}
