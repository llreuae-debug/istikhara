// TODO: confirm production domain, reviewer bio, contact email, and social profiles before launch.

export const SITE_CONFIG = {
  appName: "Istikhara",
  appNameUr: "استخارہ",
  taglineEn: "Receive divine guidance through Quranic verse",
  taglineUr: "قرآنی آیات کے ذریعے الہٰی رہنمائی",
  appUrl:
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_URL) ||
    "https://istikhara-quran-app.netlify.app", // TODO: set final custom domain in .env (VITE_APP_URL)
  contactEmail: "contact@istikhara.app", // TODO: confirm contact email
  reviewer: {
    name: "Pending Scholar Review", // TODO: add verified scholar reviewer name
    bio: "Islamic jurisprudence & Quranic studies reviewer", // TODO: add scholar reviewer bio
  },
  socialProfiles: [] as string[], // TODO: add official social profile URLs for Organization.sameAs
  analytics: {
    src:
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_ANALYTICS_SRC) ||
      "",
    domain:
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_ANALYTICS_DOMAIN) ||
      "",
  },
  indexNowKey: "istikhara9f4c2b8a1d7e6034a912c8e7b5d4f102",
} as const;
