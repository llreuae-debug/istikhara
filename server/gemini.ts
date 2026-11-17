import { GoogleGenAI } from "@google/genai";

export interface VerseAnalysisResult {
  arabicText: string;
  transliteration?: string;
  urduInterpretation: {
    literalMeaning: string;
    background: string;
    spiritualMessage: string;
  };
  surahName?: string;
  verseNumber?: string;
}

const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

function parseImagePayload(base64Image: string): { mimeType: string; data: string } {
  const match = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: "image/jpeg", data: base64Image };
}

export async function analyzeVerseImage(base64Image: string): Promise<VerseAnalysisResult> {
  try {
    const ai = getGeminiClient();
    const { mimeType, data } = parseImagePayload(base64Image);

    // First, use vision to extract and recognize the Arabic text from the image
    const visionResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this image of a Quranic verse. Extract the Arabic text exactly as it appears.
If you can identify which Surah and verse number it is, include that information.
Respond in JSON format with this structure:
{
  "arabicText": "exact Arabic text from the image",
  "surahName": "name of the Surah (if identifiable)",
  "verseNumber": "verse number (if identifiable)",
  "transliteration": "optional romanized transliteration"
}`,
            },
            {
              inlineData: {
                mimeType,
                data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
      },
    });

    const extractedData = JSON.parse(visionResponse.text || "{}");

    // Now generate detailed Urdu interpretation
    const interpretationResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Write a detailed spiritual interpretation in Urdu for the following Quranic verse as if it appeared in someone's فال (divine sign or istikhara):

Arabic Text: ${extractedData.arabicText}
${extractedData.surahName ? `Surah: ${extractedData.surahName}` : ""}
${extractedData.verseNumber ? `Verse: ${extractedData.verseNumber}` : ""}

Provide the interpretation in JSON format with three sections in Urdu:
{
  "literalMeaning": "لفظی معنی - explain the literal meaning of this verse in simple, clear Urdu (3-4 sentences)",
  "background": "پس منظر - explain when this verse was revealed, its historical context, and what situation it addressed (4-5 sentences in Urdu)",
  "spiritualMessage": "فال کے مطابق روحانی پیغام - provide spiritual guidance and meaning for someone who received this verse as a sign. What message might Allah be conveying to them? How should they reflect on this? (5-6 sentences in beautiful, uplifting Urdu)"
}

Make sure all text is in proper Urdu script and deeply meaningful.`,
      config: {
        systemInstruction: `You are an Islamic scholar and spiritual guide specializing in Quranic interpretation and Istikhara (seeking divine guidance).
Your role is to provide thoughtful, reverent, and detailed spiritual interpretations in fluent, natural Urdu.

When someone receives a Quranic verse through Istikhara or Faal (divine sign), you help them understand:
1. The literal meaning of the verse in simple Urdu
2. The historical and contextual background
3. The spiritual message and guidance it may offer for their current situation

Write in beautiful, flowing Urdu that is easy to understand. Be compassionate, wise, and spiritually uplifting.`,
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
      },
    });

    const urduInterpretation = JSON.parse(interpretationResponse.text || "{}");

    return {
      arabicText: extractedData.arabicText,
      transliteration: extractedData.transliteration,
      surahName: extractedData.surahName,
      verseNumber: extractedData.verseNumber,
      urduInterpretation: {
        literalMeaning: urduInterpretation.literalMeaning,
        background: urduInterpretation.background,
        spiritualMessage: urduInterpretation.spiritualMessage,
      },
    };
  } catch (error: any) {
    console.error("Error analyzing verse:", error);
    throw new Error(`Failed to analyze verse with Gemini: ${error.message}`);
  }
}
