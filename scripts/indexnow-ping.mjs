import { SITE_CONFIG } from "../src/config/site.ts";

const APP_URL =
  process.env.VITE_APP_URL || "https://istikhara-quran-app.netlify.app";
const KEY = "istikhara9f4c2b8a1d7e6034a912c8e7b5d4f102";

async function main() {
  const urlList = [
    `${APP_URL}/ur/`,
    `${APP_URL}/en/`,
    `${APP_URL}/ur/guide`,
    `${APP_URL}/en/guide`,
    `${APP_URL}/ur/dua`,
    `${APP_URL}/en/dua`,
    `${APP_URL}/ur/daily`,
    `${APP_URL}/en/daily`,
    `${APP_URL}/ur/studio`,
    `${APP_URL}/en/studio`,
  ];

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: new URL(APP_URL).host,
      key: KEY,
      keyLocation: `${APP_URL}/${KEY}.txt`,
      urlList,
    }),
  });
  console.log("IndexNow status:", res.status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
