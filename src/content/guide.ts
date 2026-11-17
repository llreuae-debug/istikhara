export interface GuideStep {
  id: string;
  number: number;
  titleUr: string;
  titleEn: string;
  bodyUr: string;
  bodyEn: string;
}

export interface GuideFaqItem {
  id: string;
  questionUr: string;
  questionEn: string;
  answerUr: string;
  answerEn: string;
}

export const SUNNAH_STEPS: GuideStep[] = [
  {
    id: "wudu",
    number: 1,
    titleUr: "وضو کریں",
    titleEn: "Perform Wudu",
    bodyUr: "سنتِ نبوی ﷺ کے مطابق تازہ وضو کریں اور دل کو دنیاوی الجھنوں سے فارغ کر کے اللہ کی طرف متوجہ ہوں۔",
    bodyEn: "Perform fresh wudu and turn your heart calmly toward Allah with sincerity.",
  },
  {
    id: "prayer",
    number: 2,
    titleUr: "دو رکعت نفل نماز ادا کریں",
    titleEn: "Pray Two Rak'ahs of Nafl",
    bodyUr: "فرض نماز کے علاوہ دو رکعت نفل نماز استخارہ کی نیت سے پڑھیں (مکروہ اوقات کے علاوہ کسی بھی وقت پڑھ سکتے ہیں)۔",
    bodyEn: "Pray two voluntary (nafl) rak'ahs outside of prohibited prayer times, with the intention of Istikhara.",
  },
  {
    id: "dua",
    number: 3,
    titleUr: "مسنون دعائے استخارہ پڑھیں",
    titleEn: "Recite the Sunnah Dua",
    bodyUr: "سلام پھیرنے کے بعد مسنون دعائے استخارہ پڑھیں اور دعا میں «هَذَا الْأَمْرَ» کی جگہ اپنے معاملے کا تصور یا ذکر کریں۔",
    bodyEn: "After concluding the prayer, recite the Istikhara dua from Sahih al-Bukhari 1162, holding your specific decision in mind at «this matter».",
  },
  {
    id: "tawakkul",
    number: 4,
    titleUr: "توکل کے ساتھ قدم بڑھائیں",
    titleEn: "Proceed with Trust (Tawakkul)",
    bodyUr: "استخارہ کے بعد اللہ پر بھروسہ کرتے ہوئے جو راستہ بہتر معلوم ہو اس پر قدم بڑھائیں؛ اگر خیر ہو گی تو اللہ اسباب آسان فرما دے گا۔",
    bodyEn: "Move forward with trust in Allah toward what appears sound. If it is good for you, Allah will ease its path; if not, He will turn it away and guide you to better.",
  },
  {
    id: "istishara",
    number: 5,
    titleUr: "اہلِ علم و تجربہ سے مشورہ (استشارہ)",
    titleEn: "Seek Counsel (Istishara)",
    bodyUr: "اہم معاملات میں اہلِ علم، بزرگوں اور تجربہ کار افراد سے مشورہ بھی کریں — استخارہ اور مشورہ دونوں سنت ہیں۔",
    bodyEn: "For major decisions, combine Istikhara with counsel from knowledgeable, trustworthy people.",
  },
];

export const GUIDE_FAQS: GuideFaqItem[] = [
  {
    // TODO: scholar review
    id: "dream-required",
    questionUr: "کیا استخارہ کے بعد خواب آنا ضروری ہے؟",
    questionEn: "Is it necessary to see a dream after Istikhara?",
    answerUr: "نہیں، خواب آنا ضروری نہیں۔ اصل بات اللہ سے خیر طلب کرنا اور توکل کے ساتھ جائز اسباب اختیار کرنا ہے۔ اسباب کا آسان ہو جانا یا دل کا مطمئن ہونا بھی رہنمائی کی صورت ہو سکتی ہے۔",
    answerEn: "No, a dream is not required. The essence of Istikhara is asking Allah for what is best and then proceeding with sound judgment and tawakkul.",
  },
  {
    // TODO: scholar review
    id: "any-time",
    questionUr: "کیا استخارہ صرف رات کو سونے سے پہلے کیا جاتا ہے؟",
    questionEn: "Can Istikhara only be performed at night before sleeping?",
    answerUr: "نہیں، استخارہ مکروہ اوقات کے علاوہ دن یا رات کے کسی بھی حصے میں کیا جا سکتا ہے۔",
    answerEn: "No. Outside the prohibited prayer times, Istikhara can be performed at any time of day or night.",
  },
  {
    // TODO: scholar review
    id: "repeat",
    questionUr: "کیا ایک ہی معاملے کے لیے بار بار استخارہ کرنا چاہیے؟",
    questionEn: "Should I repeat Istikhara for the same matter?",
    answerUr: "اگر معاملہ واضح نہ ہو تو چند بار (مثلاً سات بار تک) استخارہ کی نماز و دعا کی جا سکتی ہے، لیکن محض بے چینی یا من پسند نتیجے کے لیے بار بار آیت نکالنا درست طرزِ عمل نہیں۔",
    answerEn: "You may repeat the Sunnah prayer and dua if clarity has not yet settled, but repeatedly drawing verses hoping for a preferred sign is discouraged.",
  },
  {
    // TODO: scholar review
    id: "on-behalf",
    questionUr: "کیا کوئی دوسرا شخص میرے لیے استخارہ کر سکتا ہے؟",
    questionEn: "Can someone else perform Istikhara on my behalf?",
    answerUr: "مسنون طریقہ یہی ہے کہ ہر شخص اپنا استخارہ خود کرے، کیونکہ دعا میں خود اللہ سے رجوع کرنے کی خاص برکت ہے۔ البتہ والدین یا نیک لوگ خیر کی دعا ضرور کر سکتے ہیں۔",
    answerEn: "The Sunnah is for each person to perform their own Istikhara directly, though family and righteous people can certainly make dua for your good.",
  },
  {
    // TODO: scholar review
    id: "quran-reflection",
    questionUr: "اس ایپ میں قرآنی آیت دکھانے کا مقصد کیا ہے؟",
    questionEn: "What is the purpose of showing a Quranic verse in this app?",
    answerUr: "یہ آیت صرف تدبر و غور و فکر اور دل کے سکون کے لیے ہے، نہ کہ کوئی شرعی حکم یا فال۔ اصل استخارہ دو رکعت نماز اور مسنون دعا ہے۔",
    answerEn: "The verse is presented purely for quiet reflection (tadabbur), not as a ruling or omen. The Sunnah Istikhara remains the two rak'ahs and the dua.",
  },
];
