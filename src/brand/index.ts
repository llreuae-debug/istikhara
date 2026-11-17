import { SITE_CONFIG } from "@/config/site";
import { BRAND_COLORS, LOGO_PATHS, drawBrandMarkOnCanvas } from "./paths";

export const BRAND = {
  name: SITE_CONFIG.appName,
  nameUr: SITE_CONFIG.appNameUr,
  taglineEn: SITE_CONFIG.taglineEn,
  taglineUr: SITE_CONFIG.taglineUr,
  appUrl: SITE_CONFIG.appUrl,
  colors: BRAND_COLORS,
  paths: LOGO_PATHS,
  drawMark: drawBrandMarkOnCanvas,
} as const;
