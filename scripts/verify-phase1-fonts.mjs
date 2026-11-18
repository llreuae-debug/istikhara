import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 4177;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/phase1";

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

const TEST_VERSES = [
  { s: 2, a: 255, label: "2-255" },
  { s: 2, a: 286, label: "2-286" },
  { s: 9, a: 1, label: "9-1" },
  { s: 96, a: 19, label: "96-19-sajdah" },
  { s: 1, a: 1, label: "1-1" },
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
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      acceptDownloads: true,
    });
    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") console.error("[browser console]", msg.text());
    });
    page.on("pageerror", (err) => console.error("[pageerror]", err));

    // Check both scripts on test verses
    for (const v of TEST_VERSES) {
      await page.goto(`${BASE_URL}/ur/studio?s=${v.s}&a=${v.a}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(600);

      for (const script of ["indopak", "madani"]) {
        const scriptSelect = page.getByLabel(/رسم الخط \/ Script/);
        await scriptSelect.selectOption(script);
        await page.waitForTimeout(500);
        const canvas = page.locator("canvas").first();
        await canvas.screenshot({
          path: path.join(OUT_DIR, `${v.label}-${script}.png`),
        });
      }
    }

    // Export a real MP4 on 1:1 (short)
    await page.goto(`${BASE_URL}/ur/studio?s=1&a=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const exportBtn = page.getByRole("button", { name: /MP4 ڈاؤن لوڈ کریں|Download MP4/i });
    await exportBtn.click();
    const mp4Link = page.locator('a[download$=".mp4"]');
    try {
      await mp4Link.waitFor({ state: "visible", timeout: 45000 });
    } catch (e) {
      const btnText = await exportBtn.textContent().catch(() => "");
      const bodyText = await page.locator("main").innerText().catch(() => "");
      console.error("Export did not finish. Button:", btnText);
      console.error("Tail of main text:", bodyText.slice(-600));
      throw e;
    }
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15000 }),
      mp4Link.click(),
    ]);
    const mp4Path = path.join(OUT_DIR, "phase1-test.mp4");
    await download.saveAs(mp4Path);
    const stat = fs.statSync(mp4Path);
    console.log(`Exported MP4: ${mp4Path} (${stat.size} bytes)`);
    if (stat.size < 10000) throw new Error("MP4 file unexpectedly small");

    await browser.close();
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
