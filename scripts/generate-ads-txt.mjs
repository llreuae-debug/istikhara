import fs from "node:fs";
import path from "node:path";

const pubId =
  process.env.VITE_ADMOB_PUBLISHER_ID ||
  process.env.VITE_ADSENSE_PUBLISHER_ID ||
  "pub-0000000000000000"; // TODO: set VITE_ADMOB_PUBLISHER_ID / VITE_ADSENSE_PUBLISHER_ID in .env

const line = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

fs.writeFileSync(path.resolve("public/ads.txt"), line);
fs.writeFileSync(path.resolve("public/app-ads.txt"), line);
console.log(`Generated public/ads.txt and public/app-ads.txt for ${pubId}`);
