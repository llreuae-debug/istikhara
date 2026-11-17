import fs from "node:fs";
import path from "node:path";

const BASE = "https://api.alquran.cloud/v1";
const EDITIONS = ["quran-uthmani", "ur.jalandhry", "en.sahih"];
const OUT_DIR = path.resolve("public/data/quran");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed ${url}: HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.code !== 200 || !json.data) {
    throw new Error(`Invalid API payload for ${url}`);
  }
  return json.data;
}

async function main() {
  console.log("Fetching Quran editions and metadata from Al-Quran Cloud...");
  const [meta, ...editionsData] = await Promise.all([
    fetchJson(`${BASE}/meta`),
    ...EDITIONS.map((ed) => fetchJson(`${BASE}/quran/${ed}`)),
  ]);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const globalIndex = {};
  const surahMeta = meta.surahs.references.map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));

  if (surahMeta.length !== 114) {
    throw new Error(`Expected 114 surahs in meta, got ${surahMeta.length}`);
  }

  for (let idx = 0; idx < EDITIONS.length; idx++) {
    const edition = EDITIONS[idx];
    const data = editionsData[idx];
    const surahs = data.surahs;

    if (!Array.isArray(surahs) || surahs.length !== 114) {
      throw new Error(`Edition ${edition} has ${surahs?.length} surahs (expected 114)`);
    }

    const editionDir = path.join(OUT_DIR, edition);
    fs.mkdirSync(editionDir, { recursive: true });

    let expectedGlobal = 1;
    for (const surah of surahs) {
      for (const ayah of surah.ayahs) {
        if (ayah.number !== expectedGlobal) {
          throw new Error(
            `Non-continuous global ayah in ${edition}: expected ${expectedGlobal}, got ${ayah.number}`
          );
        }
        if (idx === 0) {
          globalIndex[ayah.number] = {
            s: surah.number,
            a: ayah.numberInSurah,
            j: ayah.juz,
          };
        }
        expectedGlobal++;
      }

      const outSurah = {
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        ayahs: surah.ayahs.map((a) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          juz: a.juz,
          text: a.text,
        })),
      };

      fs.writeFileSync(
        path.join(editionDir, `${surah.number}.json`),
        JSON.stringify(outSurah)
      );
    }

    if (expectedGlobal - 1 !== 6236) {
      throw new Error(
        `Edition ${edition} has ${expectedGlobal - 1} ayahs (expected 6236)`
      );
    }
    console.log(`Validated ${edition}: 114 surahs, 6236 ayahs.`);
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ surahs: surahMeta, ayahs: globalIndex })
  );

  const fetchedAt = new Date().toISOString();
  const sourceMd = `# Quran Data Sources

Fetched on: ${fetchedAt}

- **Arabic (Uthmani)**: \`https://api.alquran.cloud/v1/quran/quran-uthmani\`
- **Urdu (Fateh Muhammad Jalandhry)**: \`https://api.alquran.cloud/v1/quran/ur.jalandhry\`
- **English (Sahih International)**: \`https://api.alquran.cloud/v1/quran/en.sahih\`
- **Metadata**: \`https://api.alquran.cloud/v1/meta\`

All 114 surahs and 6,236 global ayahs were validated for continuity at build time.
`;
  fs.writeFileSync(path.join(OUT_DIR, "SOURCE.md"), sourceMd);
  console.log("Wrote /public/data/quran/index.json and SOURCE.md");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
