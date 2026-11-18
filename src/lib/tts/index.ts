import { getVoiceById, type TtsProviderId } from "@/config/voices";

export interface TtsWordBoundary {
  offsetMs: number;
  durationMs: number;
  text: string;
}

export interface TtsSynthesisResult {
  audioBase64: string;
  mimeType: string;
  wordBoundaries: TtsWordBoundary[];
  provider: TtsProviderId;
  voiceLabel: string;
}

// Quranic Arabic diacritics/marks (U+064B..U+065F, U+0670, U+06D6..U+06ED) and ayah markers
const QURAN_ARABIC_MARKS_RE = /[\u064B-\u0652\u0670\u06D6-\u06ED﴿﴾]/;
const URDU_SPECIFIC_RE = /[ٹڈڑںےہکگپچژھ]/;

/**
 * Hard guard: Arabic Quranic text must NEVER be sent to AI TTS.
 * Only Urdu translation or Urdu tafseer is allowed.
 */
export function assertUrduOnlyForTts(text: string): void {
  const clean = text.trim();
  if (!clean) {
    throw new Error("TTS text cannot be empty");
  }
  if (QURAN_ARABIC_MARKS_RE.test(clean) && !URDU_SPECIFIC_RE.test(clean)) {
    throw new Error(
      "Blocked: Arabic Quran text must never be spoken by AI/TTS."
    );
  }
  if (!URDU_SPECIFIC_RE.test(clean)) {
    throw new Error(
      "Blocked: TTS input must be Urdu translation or Urdu tafseer text."
    );
  }
}

async function hashCacheKey(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(input)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return input;
}

const DB_NAME = "istikhara-tts-cache";
const STORE_NAME = "audio";

function openTtsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedTts(key: string): Promise<TtsSynthesisResult | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openTtsDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve((req.result as TtsSynthesisResult) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedTts(
  key: string,
  val: TtsSynthesisResult
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openTtsDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

export async function synthesizeUrduTts(params: {
  text: string;
  voiceId: string;
  rate: number;
}): Promise<TtsSynthesisResult> {
  assertUrduOnlyForTts(params.text);
  const voice = getVoiceById(params.voiceId);
  const rate = Math.max(0.85, Math.min(1.1, params.rate));
  const cacheKey = await hashCacheKey(`${params.text}|${voice.id}|${rate}`);

  const cached = await getCachedTts(cacheKey);
  if (cached) return cached;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: params.text,
      provider: voice.provider,
      voiceId: voice.voiceId,
      rate,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`TTS request failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    audioBase64: string;
    mimeType: string;
    wordBoundaries?: TtsWordBoundary[];
  };

  const result: TtsSynthesisResult = {
    audioBase64: data.audioBase64,
    mimeType: data.mimeType || "audio/mpeg",
    wordBoundaries: data.wordBoundaries ?? [],
    provider: voice.provider,
    voiceLabel: voice.labelUr,
  };

  await setCachedTts(cacheKey, result);
  return result;
}

export function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}
