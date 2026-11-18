import fs from "node:fs";
import path from "node:path";

const RECITERS = [
  { id: "ar.alafasy", qdcId: 7 },
  { id: "ar.abdulbasitmurattal", qdcId: 2 },
  { id: "ar.husary", qdcId: 6 },
];

const TIMINGS_DIR = path.resolve("public/data/timings");
const WORDS_UR_DIR = path.resolve("public/data/words-ur");

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
}

function normalizeSegments(verseTiming) {
  const fromMs = Number(verseTiming.timestamp_from) || 0;
  const toMs = Number(verseTiming.timestamp_to) || fromMs;
  const durMs = Math.max(100, toMs - fromMs);

  const byWord = new Map();
  for (const seg of verseTiming.segments || []) {
    if (!Array.isArray(seg) || seg.length < 3) continue;
    const wordIdx = Number(seg[0]) - 1; // 0-based
    if (!Number.isFinite(wordIdx) || wordIdx < 0) continue;
    const s = Math.max(0, Math.min(durMs, Math.round(Number(seg[1]) - fromMs)));
    const e = Math.max(s, Math.min(durMs, Math.round(Number(seg[2]) - fromMs)));
    const prev = byWord.get(wordIdx);
    if (!prev) {
      byWord.set(wordIdx, [wordIdx, s, e]);
    } else {
      prev[1] = Math.min(prev[1], s);
      prev[2] = Math.max(prev[2], e);
    }
  }

  const words = Array.from(byWord.values()).sort((a, b) => a[0] - b[0]);
  // Ensure monotonic start/end
  for (let i = 1; i < words.length; i++) {
    if (words[i][1] < words[i - 1][1]) {
      words[i][1] = words[i - 1][1];
    }
    if (words[i][2] < words[i][1]) {
      words[i][2] = words[i][1];
    }
  }
  return { fromMs, toMs, words };
}

async function fetchSurahTimings(reciter, surah) {
  const outDir = path.join(TIMINGS_DIR, reciter.id);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${surah}.json`);
  if (fs.existsSync(outPath)) return;

  const url = `https://api.qurancdn.com/api/qdc/audio/reciters/${reciter.qdcId}/audio_files?chapter=${surah}&segments=true`;
  const data = await fetchJson(url);
  const audioFile = data.audio_files?.[0];
  if (!audioFile) throw new Error(`No audio_file for ${reciter.id} surah ${surah}`);

  const rows = (audioFile.verse_timings || []).map((vt) => {
    const ayah = Number(String(vt.verse_key).split(":")[1]);
    const norm = normalizeSegments(vt);
    return {
      ayah,
      fromMs: norm.fromMs,
      toMs: norm.toMs,
      words: norm.words,
    };
  });

  fs.writeFileSync(
    outPath,
    JSON.stringify({
      reciter: reciter.id,
      surah,
      audioUrl: audioFile.audio_url,
      ayahs: rows,
    })
  );
}

async function fetchSurahWordsUr(surah) {
  fs.mkdirSync(WORDS_UR_DIR, { recursive: true });
  const outPath = path.join(WORDS_UR_DIR, `${surah}.json`);
  if (fs.existsSync(outPath)) return;

  const byAyah = {};
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${surah}?language=ur&words=true&per_page=50&page=${page}`;
    const data = await fetchJson(url);
    totalPages = data.pagination?.total_pages ?? 1;
    for (const v of data.verses || []) {
      const meanings = [];
      for (const w of v.words || []) {
        if (w.char_type_name === "word") {
          meanings.push(w.translation?.text || "");
        }
      }
      byAyah[String(v.verse_number)] = meanings;
    }
    page++;
  }

  fs.writeFileSync(outPath, JSON.stringify(byAyah));
}

async function runPool(items, concurrency, fn) {
  let idx = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (idx < items.length) {
      const i = idx++;
      await fn(items[i]);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const surahs = Array.from({ length: 114 }, (_, i) => i + 1);

  for (const r of RECITERS) {
    console.log(`Fetching timings for ${r.id} (qdcId=${r.qdcId})...`);
    await runPool(surahs, 8, (s) => fetchSurahTimings(r, s));
    console.log(`Done timings for ${r.id}`);
  }

  console.log("Fetching word-by-word Urdu meanings...");
  await runPool(surahs, 6, (s) => fetchSurahWordsUr(s));
  console.log("Done word-by-word Urdu meanings (114 surahs).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
