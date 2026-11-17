import fs from "node:fs";
import path from "node:path";

const urPath = path.resolve("src/content/i18n/ur.json");
const enPath = path.resolve("src/content/i18n/en.json");

const ur = JSON.parse(fs.readFileSync(urPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const urKeys = new Set(flattenKeys(ur));
const enKeys = new Set(flattenKeys(en));

const missingInEn = [...urKeys].filter((k) => !enKeys.has(k));
const missingInUr = [...enKeys].filter((k) => !urKeys.has(k));

if (missingInEn.length > 0 || missingInUr.length > 0) {
  console.error("i18n key parity check failed!");
  if (missingInEn.length > 0) console.error("Missing in en.json:", missingInEn);
  if (missingInUr.length > 0) console.error("Missing in ur.json:", missingInUr);
  process.exit(1);
}

console.log(`i18n check passed: ${urKeys.size} keys matched between ur.json and en.json.`);
