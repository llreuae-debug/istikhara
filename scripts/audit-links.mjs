import { spawn } from "node:child_process";
import { LinkChecker } from "linkinator";

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}`;

function startPreview() {
  return spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    stdio: "ignore",
    detached: false,
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Preview server did not start in time");
}

async function main() {
  const server = startPreview();
  try {
    await waitForServer(`${BASE_URL}/ur/`);
    const checker = new LinkChecker();
    const broken = [];

    checker.on("link", (result) => {
      if (result.state === "BROKEN") {
        broken.push({
          url: result.url,
          status: result.status,
          parent: result.parent,
        });
      }
    });

    const result = await checker.check({
      path: `${BASE_URL}/ur/`,
      recurse: true,
      linksToSkip: [
        "https://wa.me/*",
        "https://t.me/*",
        "https://twitter.com/*",
        "https://www.facebook.com/*",
        "https://quran.com/*",
        "https://sunnah.com/*",
      ],
    });

    // Check required static SEO & ads endpoints
    const requiredEndpoints = [
      "/robots.txt",
      "/sitemap.xml",
      "/llms.txt",
      "/llms-full.txt",
      "/ads.txt",
      "/app-ads.txt",
      "/manifest.webmanifest",
    ];
    for (const ep of requiredEndpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      if (!res.ok) {
        broken.push({ url: `${BASE_URL}${ep}`, status: res.status, parent: "required" });
      }
    }

    console.log(`Checked ${result.links.length} links + ${requiredEndpoints.length} endpoints.`);
    if (broken.length > 0) {
      console.error("Broken links found:", broken);
      process.exitCode = 1;
    } else {
      console.log("0 broken links!");
    }
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
