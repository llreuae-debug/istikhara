import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 4175;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve("docs/store/screenshots");

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server did not start at ${url}`);
}

const DEVICES = [
  {
    name: "android-1080x1920",
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 3, // 1080x1920
  },
  {
    name: "ios-67-1290x2796",
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3, // 1290x2796
  },
];

const PAGES = [
  { key: "home", path: "/ur/" },
  { key: "verse", path: "/ur/verses/3-159" },
  { key: "studio", path: "/ur/studio?s=3&a=159" },
  { key: "daily", path: "/ur/daily" },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"],
    { stdio: "ignore" }
  );

  try {
    await waitForServer(`${BASE_URL}/ur/`);
    const browser = await chromium.launch();

    for (const dev of DEVICES) {
      const devDir = path.join(OUT_DIR, dev.name);
      fs.mkdirSync(devDir, { recursive: true });

      const context = await browser.newContext({
        viewport: dev.viewport,
        deviceScaleFactor: dev.deviceScaleFactor,
      });
      const page = await context.newPage();

      for (const p of PAGES) {
        await page.goto(`${BASE_URL}${p.path}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(800);
        const outFile = path.join(devDir, `${p.key}.png`);
        await page.screenshot({ path: outFile, fullPage: false });
        console.log(`Saved ${outFile}`);
      }

      await context.close();
    }

    await browser.close();
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
