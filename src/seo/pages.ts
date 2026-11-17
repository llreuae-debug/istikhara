import { SITE_CONFIG } from "@/config/site";

export type SeoLang = "ur" | "en";

export interface PageSeoMeta {
  title: string;
  description: string;
  robots: string;
  ogImage: string;
  canonicalPath: string;
}

export function getPageSeo(
  key: string,
  lang: SeoLang,
  overrides?: Partial<PageSeoMeta>
): PageSeoMeta {
  const map: Record<string, Record<SeoLang, { title: string; description: string; robots?: string }>> = {
    home: {
      ur: {
        title: "استخارہ — قرآنی آیات کے ذریعے الہٰی رہنمائی",
        description: "مسنون استخارہ کا طریقہ، دعائے استخارہ مع ترجمہ اور قرآنی آیات پر غور و فکر۔ پُرسکون، نجی اور اشتہارات سے پاک ویب ایپ۔",
      },
      en: {
        title: "Istikhara — Guidance Through Quranic Verse",
        description: "Perform Sunnah Istikhara with Sahih al-Bukhari 1162 dua, Urdu & English translations, and quiet Quranic reflection.",
      },
    },
    prepare: {
      ur: {
        title: "استخارہ کی تیاری — وضو، دعا اور نیت | استخارہ",
        description: "وضو، دو رکعت نفل، صحیح بخاری کی مسنون دعائے استخارہ اور نجی نیت کے ساتھ استخارہ شروع کریں۔",
      },
      en: {
        title: "Prepare for Istikhara — Wudu, Dua & Intention",
        description: "Step-by-step Istikhara preparation with wudu reminder, Sahih al-Bukhari 1162 dua, and private device-only intention.",
      },
    },
    focus: {
      ur: {
        title: "قلب کی توجہ | استخارہ",
        description: "درود شریف پڑھیں اور اپنے معاملے پر دل کو مرکوز کریں۔",
        robots: "noindex, nofollow",
      },
      en: {
        title: "Focus Moment | Istikhara",
        description: "Recite Durood Sharif and focus your heart on your matter.",
        robots: "noindex, nofollow",
      },
    },
    result: {
      ur: {
        title: "آیتِ مبارکہ | استخارہ",
        description: "قرآنی آیت، اردو و انگریزی ترجمہ، تلاوت اور تفسیر کا لنک۔",
        robots: "noindex, nofollow",
      },
      en: {
        title: "Verse Reflection | Istikhara",
        description: "Quranic verse with Urdu and English translations, recitation, and tafsir link.",
        robots: "noindex, nofollow",
      },
    },
    daily: {
      ur: {
        title: "آج کی آیت | استخارہ",
        description: "ہر دن کے لیے ایک مشترکہ قرآنی آیت برائے غور و فکر، مع اردو و انگریزی ترجمہ اور تلاوت۔",
      },
      en: {
        title: "Verse of the Day | Istikhara",
        description: "A shared daily Quranic verse for quiet reflection with Urdu and English translations.",
      },
    },
    studio: {
      ur: {
        title: "قرآنی آیت ویڈیو اسٹوڈیو | استخارہ",
        description: "ریلز، واٹس ایپ اسٹیٹس اور فیڈ کے لیے تلاوت اور اردو/انگریزی ترجمے کے ساتھ MP4 قرآنی ویڈیو بنائیں۔",
      },
      en: {
        title: "Quran Verse Video Maker | Istikhara Studio",
        description: "Create MP4 Quran verse videos with recitation, subtitles, and social media safe-zone presets.",
      },
    },
    history: {
      ur: {
        title: "میری آیات اور یادداشتیں | استخارہ",
        description: "آپ کے آلے پر محفوظ استخارہ کی آیات اور ذاتی مشاہدات۔",
        robots: "noindex, nofollow",
      },
      en: {
        title: "My Verses & Journal | Istikhara",
        description: "Your private device-only history of verses and reflections.",
        robots: "noindex, nofollow",
      },
    },
    settings: {
      ur: {
        title: "ترتیبات | استخارہ",
        description: "زبان، تھیم، قاری، فونٹ سائز اور آف لائن قرآن کی ترتیبات۔",
        robots: "noindex, nofollow",
      },
      en: {
        title: "Settings | Istikhara",
        description: "Customize language, theme, Arabic font size, reciter, and offline Quran cache.",
        robots: "noindex, nofollow",
      },
    },
    guide: {
      ur: {
        title: "استخارہ کا مسنون طریقہ | Istikhara Guide",
        description: "صحیح بخاری 1162 کے مطابق استخارہ کی دو رکعت نماز، دعا اور مشورے کا مکمل طریقہ۔",
      },
      en: {
        title: "How to Perform Istikhara (Sunnah Method)",
        description: "Step-by-step guide to performing Sunnah Istikhara: wudu, two rak'ahs, the dua, tawakkul, and istishara.",
      },
    },
    dua: {
      ur: {
        title: "استخارہ کی دعا مع اردو و انگریزی ترجمہ",
        description: "صحیح بخاری 1162 کی مکمل دعائے استخارہ عربی، تلفظ، اردو اور انگریزی ترجمے کے ساتھ۔",
      },
      en: {
        title: "Istikhara Dua with Arabic, Urdu & English Meaning",
        description: "Complete Sahih al-Bukhari 1162 Istikhara dua with Arabic text, transliteration, Urdu, and English meanings.",
      },
    },
    verses: {
      ur: {
        title: "منتخب قرآنی آیاتِ رہنمائی و صبر | استخارہ",
        description: "توکل، صبر، امید اور رہنمائی سے متعلق 40 منتخب قرآنی آیات مع ترجمہ اور تفسیر۔",
      },
      en: {
        title: "Quranic Verses for Trust, Patience & Guidance",
        description: "Explore 40 curated Quranic verses on tawakkul, patience, and seeking clarity with translations and tafsir links.",
      },
    },
    faq: {
      ur: {
        title: "استخارہ کے مسائل اور سوالات | FAQ",
        description: "استخارہ کے بارے میں 15+ اہم شرعی اور عملی سوالات کے جوابات اردو اور انگریزی میں۔",
      },
      en: {
        title: "Istikhara FAQ — Common Questions Answered",
        description: "Answers to 15+ common questions about Istikhara dreams, timing, repetition, and Quranic reflection.",
      },
    },
    about: {
      ur: {
        title: "تعارف اور ماخذ | استخارہ",
        description: "استخارہ ویب ایپ کا مقصد، قرآنی ڈیٹا کے مستند ماخذ اور مکمل رازداری۔",
      },
      en: {
        title: "About & Sources | Istikhara",
        description: "Purpose, verified Quran and Hadith sources, and privacy commitment of the Istikhara app.",
      },
    },
    privacy: {
      ur: {
        title: "رازداری کی پالیسی | استخارہ",
        description: "استخارہ ایپ میں کوئی لاگ ان یا سرور ڈیٹا بیس نہیں؛ آپ کی تمام معلومات آپ کے آلے پر رہتی ہیں۔",
      },
      en: {
        title: "Privacy Policy | Istikhara",
        description: "Device-only storage, zero accounts, and cookieless optional analytics.",
      },
    },
    contact: {
      ur: {
        title: "رابطہ | استخارہ",
        description: "استخارہ ویب ایپ کی ٹیم سے رابطہ کریں یا تصحیح تجویز کریں۔",
      },
      en: {
        title: "Contact | Istikhara",
        description: "Reach the Istikhara maintainers for feedback or scholar review submissions.",
      },
    },
  };

  const entry = map[key]?.[lang] ?? {
    title: `${SITE_CONFIG.appName} — ${SITE_CONFIG.appNameUr}`,
    description: lang === "ur" ? SITE_CONFIG.taglineUr : SITE_CONFIG.taglineEn,
  };

  return {
    title: overrides?.title ?? entry.title,
    description: overrides?.description ?? entry.description,
    robots: overrides?.robots ?? entry.robots ?? "index, follow",
    ogImage: overrides?.ogImage ?? `${SITE_CONFIG.appUrl}/og/${key}-${lang}.png`,
    canonicalPath: overrides?.canonicalPath ?? `/${lang}/${key === "home" ? "" : key}`,
  };
}
