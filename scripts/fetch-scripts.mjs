import fs from "node:fs";
import path from "node:path";

const INDEX_PATH = path.resolve("public/data/quran/index.json");
const OUT_DIR = path.resolve("public/data/quran");

async function fetchQuranComScript(endpoint, fieldName) {
  const url = `https://api.quran.com/api/v4/quran/verses/${endpoint}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.verses) || data.verses.length !== 6236) {
    throw new Error(`Expected 6236 verses from ${url}, got ${data.verses?.length}`);
  }
  const byKey = new Map();
  for (const v of data.verses) {
    byKey.set(v.verse_key, v[fieldName]);
  }
  return byKey;
}

async function writeEdition(editionId, versesMap, indexData) {
  const dir = path.join(OUT_DIR, editionId);
  fs.mkdirSync(dir, { recursive: true });

  let count = 0;
  for (const surah of indexData.surahs) {
    // Load existing quran-uthmani to preserve juz & global ayah number
    const baseSurah = JSON.parse(
      fs.readFileSync(path.join(OUT_DIR, "quran-uthmani", `${surah.number}.json`), "utf8")
    );
    const ayahs = baseSurah.ayahs.map((a) => {
      const key = `${surah.number}:${a.numberInSurah}`;
      const text = versesMap.get(key);
      if (!text) throw new Error(`Missing verse ${key} in ${editionId}`);
      count++;
      return {
        number: a.number,
        numberInSurah: a.numberInSurah,
        juz: a.juz,
        text,
      };
    });

    fs.writeFileSync(
      path.join(dir, `${surah.number}.json`),
      JSON.stringify({
        number: baseSurah.number,
        name: baseSurah.name,
        englishName: baseSurah.englishName,
        englishNameTranslation: baseSurah.englishNameTranslation,
        ayahs,
      })
    );
  }
  if (count !== 6236) throw new Error(`Expected 6236 ayahs written for ${editionId}, got ${count}`);
  console.log(`Validated ${editionId}: 114 surahs, ${count} ayahs.`);
}

async function main() {
  const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  console.log("Fetching QPC Hafs (uthmani) and IndoPak scripts from Quran.com / QUL...");
  const [uthmaniMap, indopakMap] = await Promise.all([
    fetchQuranComScript("uthmani", "text_uthmani"),
    fetchQuranComScript("indopak", "text_indopak"),
  ]);

  await writeEdition("qpc-hafs", uthmaniMap, indexData);
  await writeEdition("qul-indopak", indopakMap, indexData);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
