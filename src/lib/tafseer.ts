import { getCachedVerse, setCachedVerse } from "./storage";

export interface TafseerParagraph {
  index: number;
  text: string;
  wordCount: number;
}

export interface FetchedTafseer {
  slug: string;
  surah: number;
  ayah: number;
  paragraphs: TafseerParagraph[];
}

export function cleanTafseerHtml(raw: string): string[] {
  if (!raw || typeof raw !== "string") return [];

  const withBreaks = raw
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6]|blockquote)\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  const blocks = withBreaks
    .split(/\n{2,}/)
    .map((b) => b.replace(/[ \t\n]+/g, " ").trim())
    .filter(Boolean);

  if (blocks.length > 1) return blocks;

  // If source came as a single long plain-text block, split gently into ~65-word sentence paragraphs
  const single = blocks[0] || "";
  const words = single.split(/\s+/).filter(Boolean);
  if (words.length <= 80) return single ? [single] : [];

  const sentenceChunks = single
    .split(/(?<=[۔.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentenceChunks.length <= 1) return [single];

  const paragraphs: string[] = [];
  let acc = "";
  let accWords = 0;
  for (const s of sentenceChunks) {
    const wc = s.split(/\s+/).filter(Boolean).length;
    if (acc && accWords + wc > 75) {
      paragraphs.push(acc.trim());
      acc = s;
      accWords = wc;
    } else {
      acc = acc ? `${acc} ${s}` : s;
      accWords += wc;
    }
  }
  if (acc.trim()) paragraphs.push(acc.trim());
  return paragraphs;
}

export async function fetchTafseer(
  slug: string,
  surah: number,
  ayah: number
): Promise<FetchedTafseer | null> {
  const cacheKey = `tafseer:v1:${slug}:${surah}:${ayah}`;
  if (typeof window !== "undefined") {
    const cached = await getCachedVerse<FetchedTafseer>(cacheKey);
    if (cached && cached.paragraphs.length > 0) return cached;
  }

  const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${slug}/${surah}/${ayah}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const json = (await res.json()) as { text?: string };
  if (!json.text || !json.text.trim()) return null;

  const rawParagraphs = cleanTafseerHtml(json.text);
  if (rawParagraphs.length === 0) return null;

  const paragraphs: TafseerParagraph[] = rawParagraphs.map((text, index) => ({
    index,
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  }));

  const result: FetchedTafseer = { slug, surah, ayah, paragraphs };
  if (typeof window !== "undefined") {
    await setCachedVerse(cacheKey, result);
  }
  return result;
}
