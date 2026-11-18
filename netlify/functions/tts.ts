import type { Handler } from "@netlify/functions";

const QURAN_ARABIC_MARKS_RE = /[\u064B-\u0652\u0670\u06D6-\u06ED﴿﴾]/;
const URDU_SPECIFIC_RE = /[ٹڈڑںےہکگپچژھ]/;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}") as {
      text?: string;
      provider?: "azure" | "google" | "elevenlabs";
      voiceId?: string;
      rate?: number;
    };

    const text = (body.text || "").trim();
    if (!text || (QURAN_ARABIC_MARKS_RE.test(text) && !URDU_SPECIFIC_RE.test(text)) || !URDU_SPECIFIC_RE.test(text)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Only Urdu translation/tafseer text is permitted." }),
      };
    }

    const rate = Math.max(0.85, Math.min(1.1, Number(body.rate) || 0.95));
    const provider = body.provider || "azure";
    const voiceId = body.voiceId || "ur-PK-UzmaNeural";

    if (provider === "azure") {
      const key = process.env.AZURE_SPEECH_KEY;
      const region = process.env.AZURE_SPEECH_REGION || "eastus";
      if (!key) {
        return {
          statusCode: 503,
          body: JSON.stringify({ error: "AZURE_SPEECH_KEY is not configured" }),
        };
      }
      const ratePct = `${Math.round((rate - 1) * 100)}%`;
      const ssml = `<speak version='1.0' xml:lang='ur-PK'><voice xml:lang='ur-PK' name='${escapeXml(voiceId)}'><prosody rate='${ratePct}'>${escapeXml(text)}</prosody></voice></speak>`;
      const res = await fetch(
        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
          },
          body: ssml,
        }
      );
      if (!res.ok) {
        return { statusCode: res.status, body: await res.text() };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: buf.toString("base64"),
          mimeType: "audio/mpeg",
          wordBoundaries: [],
        }),
      };
    }

    if (provider === "google") {
      const key = process.env.GOOGLE_TTS_API_KEY;
      if (!key) {
        return {
          statusCode: 503,
          body: JSON.stringify({ error: "GOOGLE_TTS_API_KEY is not configured" }),
        };
      }
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: "ur-IN", name: voiceId },
            audioConfig: { audioEncoding: "MP3", speakingRate: rate },
          }),
        }
      );
      if (!res.ok) {
        return { statusCode: res.status, body: await res.text() };
      }
      const data = (await res.json()) as { audioContent: string };
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: data.audioContent,
          mimeType: "audio/mpeg",
          wordBoundaries: [],
        }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Unsupported TTS provider: ${provider}` }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err instanceof Error ? err.message : "TTS error" }),
    };
  }
};
