// TODO: human review & scholar verification of all religious prose before launch.

export interface ArticleSection {
  headingUr: string;
  headingEn: string;
  bodyUr: string;
  bodyEn: string;
}

export interface ArticleData {
  slug: string;
  titleUr: string;
  titleEn: string;
  keywordsUr: string;
  keywordsEn: string;
  summaryUr: string;
  summaryEn: string;
  lastUpdated: string;
  sections: ArticleSection[];
  takeawaysUr: string[];
  takeawaysEn: string[];
  relatedSlugs: string[];
  sources: Array<{ label: string; url: string }>;
}

export const ARTICLES: ArticleData[] = [
  {
    slug: "istikhara-for-marriage",
    titleUr: "رشتے کے لیے استخارہ — مکمل رہنمائی",
    titleEn: "Istikhara for Marriage — Complete Guide",
    keywordsUr: "رشتے کے لیے استخارہ, نکاح کا استخارہ, rishte ke liye istikhara",
    keywordsEn: "istikhara for marriage, rishte ke liye istikhara, marriage dua",
    summaryUr:
      "رشتے کے لیے استخارہ کرنے کا مسنون طریقہ یہ ہے کہ دو رکعت نفل نماز پڑھ کر صحیح بخاری (1162) کی دعا مانگی جائے اور دعا میں اس رشتے کا تصور یا ذکر کیا جائے۔ استخارہ کے ساتھ والدین اور اہلِ علم سے مشورہ (استشارہ) اور تحقیق بھی سنت ہے۔",
    summaryEn:
      "To perform Istikhara for marriage, pray two voluntary rak'ahs and recite the Sunnah dua from Sahih al-Bukhari 1162 while holding the specific proposal in mind. Combine Istikhara with practical due diligence and counsel (istishara) from trustworthy family and people of knowledge.",
    lastUpdated: "2026-11-18",
    sections: [
      {
        headingUr: "رشتے کے لیے استخارہ کب اور کیسے کریں؟",
        headingEn: "When and how should you pray Istikhara for a proposal?",
        bodyUr:
          "جب کسی رشتے کی بات چلے اور آپ سنجیدگی سے غور کر رہے ہوں تو مکروہ اوقات کے علاوہ کسی بھی وقت تازہ وضو کر کے دو رکعت نفل ادا کریں اور پھر دعائے استخارہ پڑھیں۔ یہ عمل ہر شخص خود اپنے لیے کرے۔",
        bodyEn:
          "Once a marriage proposal is under serious consideration, perform wudu outside the prohibited prayer times, pray two nafl rak'ahs, and recite the Istikhara dua yourself.",
      },
      {
        headingUr: "کیا خواب آنا یا اشارہ ملنا ضروری ہے؟",
        headingEn: "Do you need to see a dream after marriage Istikhara?",
        bodyUr:
          "نہیں، کسی خاص رنگ یا خواب کا آنا ضروری نہیں۔ اللہ پر بھروسہ کرتے ہوئے جائز تحقیق اور مشورہ جاری رکھیں؛ دل کا اطمینان یا اسباب کا آسان یا مشکل ہو جانا خیر کی علامت ہو سکتی ہے۔",
        bodyEn:
          "No specific dream or color is required. Continue prudent inquiry and consultation with tawakkul; ease in the path or peace of heart can follow.",
      },
    ],
    takeawaysUr: [
      "ہر بالغ فرد اپنا استخارہ خود کرے (صحیح بخاری 1162)۔",
      "خواب کا انتظار کرنے کی بجائے تحقیق اور استشارہ ساتھ جاری رکھیں۔",
      "نتائج کو اللہ کے سپرد کر کے دل کو مطمئن رکھیں۔",
    ],
    takeawaysEn: [
      "Perform the two rak'ahs and dua yourself (Sahih al-Bukhari 1162).",
      "Do not wait passively for a dream—combine prayer with due diligence.",
      "Trust Allah with the outcome whether the path opens or closes.",
    ],
    relatedSlugs: ["guide", "dua", "after-istikhara"],
    sources: [
      { label: "Sahih al-Bukhari 1162", url: "https://sunnah.com/bukhari:1162" },
      { label: "Quran 3:159 (Consultation & Tawakkul)", url: "https://quran.com/3/159" },
    ],
  },
  {
    slug: "istikhara-for-business",
    titleUr: "کاروبار کے لیے استخارہ",
    titleEn: "Istikhara for Business & Partnerships",
    keywordsUr: "کاروبار کے لیے استخارہ, تجارت استخارہ",
    keywordsEn: "istikhara for business, business partnership dua",
    summaryUr:
      "نئے کاروبار، شراکت یا سرمایہ کاری سے پہلے استخارہ کرنا سنتِ نبوی ﷺ ہے۔ دو رکعت نفل اور مسنون دعا کے ساتھ ماہرین سے مشورہ، مالی حساب کتاب اور حلال ذرائع کی تحقیق ضروری ہے۔",
    summaryEn:
      "Seeking Allah's guidance before launching a business, partnership, or investment is a blessed Sunnah. Pair the two rak'ahs and Sahih al-Bukhari 1162 dua with sound financial review, transparent contracts, and expert counsel.",
    lastUpdated: "2026-11-18",
    sections: [
      {
        headingUr: "کاروباری فیصلے میں استخارہ اور مشورہ کیسے جمع کریں؟",
        headingEn: "How do Istikhara and market research work together?",
        bodyUr:
          "قرآن کریم (آل عمران: 159) میں مشورہ کرنے کے بعد اللہ پر توکل کرنے کا حکم ہے۔ استخارہ آپ کو اسباب ترک کرنے کا نہیں بلکہ بہتر اسباب اختیار کر کے اللہ سے برکت مانگنے کا درس دیتا ہے۔",
        bodyEn:
          "The Quran (3:159) teaches consultation followed by trust in Allah. Istikhara does not replace due diligence—it asks Allah to bless what is sound and turn away hidden harm.",
      },
    ],
    takeawaysUr: [
      "معاہدے اور حلال آمدن کی جانچ کے بعد استخارہ کریں۔",
      "تجربہ کار تاجروں اور اہلِ علم سے مشورہ لیں۔",
    ],
    takeawaysEn: [
      "Verify lawful (halal) terms and contracts alongside Istikhara.",
      "Seek advice from experienced, trustworthy mentors.",
    ],
    relatedSlugs: ["guide", "dua", "istikhara-for-job"],
    sources: [
      { label: "Sahih al-Bukhari 1162", url: "https://sunnah.com/bukhari:1162" },
      { label: "Quran 3:159", url: "https://quran.com/3/159" },
    ],
  },
  {
    slug: "istikhara-for-job",
    titleUr: "ملازمت اور کیریئر کے لیے استخارہ",
    titleEn: "Istikhara for a Job & Career Decision",
    keywordsUr: "ملازمت کے لیے استخارہ, نوکری کا استخارہ",
    keywordsEn: "istikhara for job, career decision dua",
    summaryUr:
      "نئی ملازمت قبول کرنے، نوکری بدلنے یا بیرونِ ملک سفر کے فیصلے میں دو رکعت نمازِ استخارہ اور دعا پڑھیں۔ اگر دل مطمئن ہو اور اسباب حلال و موزوں ہوں تو توکل کے ساتھ قدم بڑھائیں۔",
    summaryEn:
      "When weighing a job offer, career change, or relocation, pray two rak'ahs and recite the Istikhara dua. If the role is lawful and practical assessment is sound, step forward with tawakkul.",
    lastUpdated: "2026-11-18",
    sections: [
      {
        headingUr: "دو نوکریوں میں سے انتخاب کیسے کریں؟",
        headingEn: "How to choose between two job offers?",
        bodyUr:
          "دونوں مواقع کے فوائد و نقصانات کا جائزہ لیں، سینئرز سے مشورہ کریں اور پھر جس طرف رجحان زیادہ ہو اس کے لیے استخارہ کر کے قدم بڑھائیں۔",
        bodyEn:
          "Compare the practical pros and cons, consult mentors, and pray Istikhara as you commit to the stronger path.",
      },
    ],
    takeawaysUr: [
      "فرض نماز کے اوقات اور حلال روزگار کو ترجیح دیں۔",
      "مشورہ اور استخارہ دونوں ساتھ لے کر چلیں۔",
    ],
    takeawaysEn: [
      "Consider ethical alignment and family well-being alongside pay.",
      "Combine Istikhara with istishara before signing.",
    ],
    relatedSlugs: ["guide", "after-istikhara", "istikhara-for-business"],
    sources: [
      { label: "Sahih al-Bukhari 1162", url: "https://sunnah.com/bukhari:1162" },
      { label: "Quran 65:3", url: "https://quran.com/65/3" },
    ],
  },
  {
    slug: "after-istikhara",
    titleUr: "استخارہ کے بعد کیا کریں؟",
    titleEn: "What to Do After Istikhara",
    keywordsUr: "استخارہ کے بعد کیا کریں, استخارہ کا نتیجہ",
    keywordsEn: "what to do after istikhara, signs after istikhara",
    summaryUr:
      "استخارہ کے بعد لازمی نہیں کہ خواب آئے؛ اصل نتیجہ یہ ہے کہ آپ مشورے اور سوچ بچار کے بعد جائز اقدام کریں۔ اگر کام میں خیر ہو گی تو اللہ اسباب آسان فرما دے گا، ورنہ بہتر راستے کی طرف موڑ دے گا۔",
    summaryEn:
      "After praying Istikhara, you do not need to wait for a dream. Proceed calmly with your best judgment and counsel: if the matter is good for your faith and livelihood, Allah eases it; otherwise, He redirects you to better.",
    lastUpdated: "2026-11-18",
    sections: [
      {
        headingUr: "دعا کے الفاظ میں کیا رہنمائی ہے؟",
        headingEn: "What does the Istikhara dua itself teach us?",
        bodyUr:
          "دعا میں ہم اللہ سے مانگتے ہیں کہ اگر یہ کام بہتر ہے تو اسے مقدر اور آسان فرما، اور اگر برا ہے تو اسے مجھ سے پھیر دے۔ اس لیے اقدام کرنے پر رکاوٹ آنا بھی دعا کی قبولیت ہو سکتی ہے۔",
        bodyEn:
          "The dua explicitly asks Allah to ordain and ease the matter if it is good, or turn it away if it is harmful. Therefore, an unexpected closure can itself be an answered prayer.",
      },
    ],
    takeawaysUr: [
      "خواب کی تلاش میں بے چین نہ ہوں۔",
      "اگر معاملہ نہ بنے تو اللہ کے فیصلے پر راضی رہیں۔",
    ],
    takeawaysEn: [
      "Do not feel anxious if no dream occurs.",
      "Accept smooth openings or closed doors with contentment.",
    ],
    relatedSlugs: ["guide", "misconceptions", "quran-and-istikhara"],
    sources: [
      { label: "Sahih al-Bukhari 1162", url: "https://sunnah.com/bukhari:1162" },
    ],
  },
  {
    slug: "misconceptions",
    titleUr: "استخارہ کے بارے میں عام غلط فہمیاں",
    titleEn: "Common Misconceptions About Istikhara",
    keywordsUr: "استخارہ غلط فہمیاں, استخارہ خواب رنگ",
    keywordsEn: "istikhara misconceptions, istikhara dream colors",
    summaryUr:
      "سب سے عام غلط فہمی یہ ہے کہ استخارہ صرف کسی عالم سے کروایا جاتا ہے یا اس کے بعد سفید/سبز خواب آنا ضروری ہے۔ سنت کے مطابق ہر مسلمان اپنا استخارہ خود کر سکتا ہے اور خواب کی کوئی شرط نہیں۔",
    summaryEn:
      "Common myths include believing someone else must pray Istikhara for you, or that seeing green/white vs. red/black in a dream decides the outcome. In the Sunnah, every Muslim can pray Istikhara directly and no dream is required.",
    lastUpdated: "2026-11-18",
    sections: [
      {
        headingUr: "کیا سبز یا کالا رنگ دیکھنے کی کوئی شرعی اصل ہے؟",
        headingEn: "Is there any basis for color-coded dreams?",
        bodyUr:
          "صحیح احادیث میں خواب کے مخصوص رنگوں (سبز، سفید، سرخ، سیاہ) کی کوئی قید نہیں ملتی۔ اصل مدار توکل، مشورہ اور اسباب کی آسانی پر ہے۔",
        bodyEn:
          "Authentic hadith texts do not prescribe specific dream colors. Rely on sound counsel, ethics, and trust in Allah.",
      },
    ],
    takeawaysUr: [
      "دوسروں سے پیسے دے کر استخارہ کروانے سے بچیں۔",
      "خواب کے رنگوں پر فیصلے کی بنیاد نہ رکھیں۔",
    ],
    takeawaysEn: [
      "Avoid paying anyone to perform Istikhara for you.",
      "Do not base decisions on supposed dream colors.",
    ],
    relatedSlugs: ["after-istikhara", "guide", "quran-and-istikhara"],
    sources: [
      { label: "Sahih al-Bukhari 1162", url: "https://sunnah.com/bukhari:1162" },
    ],
  },
  {
    slug: "quran-and-istikhara",
    titleUr: "قرآنی آیات اور استخارہ — غور و فکر کی حدود",
    titleEn: "Quranic Verses and Istikhara — Reflection vs. Ruling",
    keywordsUr: "قرآن اور استخارہ, فال نکالنا",
    keywordsEn: "quran and istikhara, quranic reflection",
    summaryUr:
      "مسنون استخارہ دو رکعت نماز اور دعا ہے، نہ کہ قرآن کھول کر فال نکالنا۔ اس ایپ میں دکھائی جانے والی قرآنی آیت صرف تدبر، دل کے سکون اور اللہ کی یاد کے لیے پیش کی جاتی ہے۔",
    summaryEn:
      "The Sunnah Istikhara is strictly two rak'ahs of prayer and the prophetic dua—not opening the Quran as fortune-telling. Any verse shown in this app is solely for quiet reflection (tadabbur) and remembrance of Allah.",
    lastUpdated: "2026-11-18",
    sections: [
      {
        headingUr: "آیت کو اچھا یا برا کیوں نہیں کہا جاتا؟",
        headingEn: "Why does this app never label a verse good or bad?",
        bodyUr:
          "قرآن کی ہر آیت کلامِ الہٰی اور ہدایت ہے؛ اسے ذاتی معاملے کے لیے ہاں یا ناں کا حکم بنانا درست نہیں۔ اس لیے ہم صرف آیت، مستند ترجمہ اور تفسیر کا لنک پیش کرتے ہیں۔",
        bodyEn:
          "Every verse of the Quran is guidance; treating a verse as a binary yes/no omen is inappropriate. That is why we show only the verse, verified translations, and a tafsir link.",
      },
    ],
    takeawaysUr: [
      "مسنون استخارہ دو رکعت نماز اور دعا ہے۔",
      "قرآنی آیات تدبر اور سکونِ قلب کے لیے ہیں۔",
    ],
    takeawaysEn: [
      "Sunnah Istikhara is the two rak'ahs and dua.",
      "Quranic verses are presented strictly for reflection.",
    ],
    relatedSlugs: ["guide", "dua", "misconceptions"],
    sources: [
      { label: "Sahih al-Bukhari 1162", url: "https://sunnah.com/bukhari:1162" },
      { label: "Quran.com", url: "https://quran.com" },
    ],
  },
];

export function getArticleBySlug(slug: string): ArticleData | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
