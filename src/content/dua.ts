// TODO: verify verbatim against https://sunnah.com/bukhari:1162 before launch

export interface IstikharaDuaContent {
  source: string;
  arabic: {
    beforeMatter: string;
    matterPhrase: string;
    middle: string;
    secondMatterPhrase: string;
    afterMatter: string;
    full: string;
  };
  transliteration: string;
  urdu: {
    text: string;
    matterHint: string;
  };
  english: {
    text: string;
    matterHint: string;
  };
}

export const ISTIKHARA_DUA: IstikharaDuaContent = {
  source: "Sahih al-Bukhari 1162",
  arabic: {
    beforeMatter:
      "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ ",
    matterPhrase: "هَذَا الْأَمْرَ",
    middle:
      " خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي — أَوْ قَالَ: عَاجِلِ أَمْرِي وَآجِلِهِ — فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ ",
    secondMatterPhrase: "هَذَا الْأَمْرَ",
    afterMatter:
      " شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي — أَوْ قَالَ: عَاجِلِ أَمْرِي وَآجِلِهِ — فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ",
    full: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ",
  },
  transliteration:
    "Allahumma inni astakhiruka bi-'ilmika wa astaqdiruka bi-qudratika, wa as'aluka min fadlika al-'azim. Fa-innaka taqdiru wa la aqdiru, wa ta'lamu wa la a'lamu, wa Anta 'Allamu al-ghuyub. Allahumma in kunta ta'lamu anna hadha al-amra khayrun li fi dini wa ma'ashi wa 'aqibati amri — 'ajili amri wa ajilihi — faqdurhu li wa yassirhu li thumma barik li fih. Wa in kunta ta'lamu anna hadha al-amra sharrun li fi dini wa ma'ashi wa 'aqibati amri — 'ajili amri wa ajilihi — fasrifhu 'anni wasrifni 'anhu, waqdur liya al-khayra haythu kana thumma ardini bih.",
  urdu: {
    text: "اے اللہ! میں تجھ سے تیرے علم کے ذریعے خیر طلب کرتا ہوں اور تیری قدرت کے ذریعے طاقت مانگتا ہوں، اور تجھ سے تیرا عظیم فضل مانگتا ہوں۔ بیشک تو قدرت رکھتا ہے اور میں قدرت نہیں رکھتا، تو جانتا ہے اور میں نہیں جانتا، اور تو غیبوں کو خوب جاننے والا ہے۔ اے اللہ! اگر تو جانتا ہے کہ یہ معاملہ میرے دین، میری معاش اور میرے انجامِ کار (یا فرمایا: میرے فوری اور بعد کے معاملے) میں میرے لیے بہتر ہے تو اسے میرے لیے مقدر فرما دے اور آسان کر دے پھر اس میں برکت عطا فرما۔ اور اگر تو جانتا ہے کہ یہ معاملہ میرے دین، میری معاش اور میرے انجامِ کار میں میرے لیے برا ہے تو اسے مجھ سے پھیر دے اور مجھے اس سے پھیر دے، اور میرے لیے جہاں کہیں خیر ہو مقدر فرما دے پھر مجھے اس پر راضی کر دے۔",
    matterHint: "یہاں «هَذَا الْأَمْرَ» کی جگہ دل میں یا زبان سے اپنے معاملے کا ذکر کریں۔",
  },
  english: {
    text: "O Allah, I seek Your guidance by Your knowledge, and I seek ability by Your power, and I ask You of Your great bounty. For You have power and I have none, and You know and I know not, and You are the Knower of the unseen. O Allah, if You know that this matter is good for me in my religion, my livelihood, and the outcome of my affairs (or in my immediate and future affairs), then ordain it for me, make it easy for me, and bless me in it. And if You know that this matter is bad for me in my religion, my livelihood, and the outcome of my affairs, then turn it away from me and turn me away from it, and ordain for me the good wherever it may be, and make me content with it.",
    matterHint: "At «this matter» (هَذَا الْأَمْرَ), mention or hold your specific decision in your heart.",
  },
};
