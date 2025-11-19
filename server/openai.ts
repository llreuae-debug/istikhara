import OpenAI from "openai";

// This is using OpenAI's API, which points to OpenAI's API servers and requires your own API key.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function analyzeVerseImage(base64Image: string): Promise<VerseAnalysisResult> {
  try {
    // First, use vision to extract and recognize the Arabic text from the image
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of a Quranic verse. Extract the Arabic text exactly as it appears. 
              If you can identify which Surah and verse number it is, include that information.
              Respond in JSON format with this structure:
              {
                "arabicText": "exact Arabic text from the image",
                "surahName": "name of the Surah (if identifiable)",
                "verseNumber": "verse number (if identifiable)",
                "transliteration": "optional romanized transliteration"
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const extractedData = JSON.parse(visionResponse.choices[0].message.content || "{}");

    // Now generate detailed Urdu interpretation
    const interpretationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an Islamic scholar and spiritual guide specializing in Quranic interpretation and Istikhara (seeking divine guidance). 
          Your role is to provide thoughtful, reverent, and detailed spiritual interpretations in fluent, natural Urdu.
          
          When someone receives a Quranic verse through Istikhara or Faal (divine sign), you help them understand:
          1. The literal meaning of the verse in simple Urdu
          2. The historical and contextual background
          3. The spiritual message and guidance it may offer for their current situation
          
          Write in beautiful, flowing Urdu that is easy to understand. Be compassionate, wise, and spiritually uplifting.`
        },
        {
          role: "user",
          content: `Write a detailed spiritual interpretation in Urdu for the following Quranic verse as if it appeared in someone's فال (divine sign or istikhara):

Arabic Text: ${extractedData.arabicText}
${extractedData.surahName ? `Surah: ${extractedData.surahName}` : ''}
${extractedData.verseNumber ? `Verse: ${extractedData.verseNumber}` : ''}

Provide the interpretation in JSON format with three sections in Urdu:
{
  "literalMeaning": "لفظی معنی - explain the literal meaning of this verse in simple, clear Urdu (3-4 sentences)",
  "background": "پس منظر - explain when this verse was revealed, its historical context, and what situation it addressed (4-5 sentences in Urdu)",
  "spiritualMessage": "فال کے مطابق روحانی پیغام - provide spiritual guidance and meaning for someone who received this verse as a sign. What message might Allah be conveying to them? How should they reflect on this? (5-6 sentences in beautiful, uplifting Urdu)"
}

Make sure all text is in proper Urdu script and deeply meaningful.`
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const urduInterpretation = JSON.parse(interpretationResponse.choices[0].message.content || "{}");

    return {
      arabicText: extractedData.arabicText,
      transliteration: extractedData.transliteration,
      surahName: extractedData.surahName,
      verseNumber: extractedData.verseNumber,
      urduInterpretation: {
        literalMeaning: urduInterpretation.literalMeaning,
        background: urduInterpretation.background,
        spiritualMessage: urduInterpretation.spiritualMessage,
      }
    };
  } catch (error: any) {
    console.error("Error analyzing verse:", error);
    throw new Error(`Failed to analyze verse: ${error.message}`);
  }
}
