import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 4179;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/studio-upgrade";

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

// Minimal valid 0.5s silent WAV encoded as base64 for mocked /api/tts in CI
function makeSilentWavBase64(durationSec = 0.6, sampleRate = 24000) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const buf = Buffer.alloc(44 + numSamples * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + numSamples * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(numSamples * 2, 40);
  return buf.toString("base64");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"],
    { stdio: "ignore" }
  );

  try {
    await waitForServer(`${BASE_URL}/ur/`);
    const browser = await chromium.launch({
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: ["microphone"],
      acceptDownloads: true,
    });
    const page = await context.newPage();

    // Mock /api/tts for CI verification
    await page.route("**/api/tts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          audioBase64: makeSilentWavBase64(0.8),
          mimeType: "audio/wav",
          wordBoundaries: [],
        }),
      });
    });

    // 1. Visual check on 2:255 with Hand pointer + Girih + Word-by-Word Urdu meaning
    await page.goto(`${BASE_URL}/ur/studio?s=2&a=255`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.getByLabel(/لفظی ترجمہ/).check();
    await page.waitForTimeout(500);
    await page.locator("canvas").first().screenshot({
      path: path.join(OUT_DIR, "2-255-hand-wbw-girih.png"),
    });

    // 2. Capture all 5 background styles + Qalam pointer on 1:1
    await page.goto(`${BASE_URL}/ur/studio?s=1&a=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.getByLabel(/پڑھنے کا اشارہ/).selectOption("qalam");
    const bgSummary = page.locator("summary", { hasText: "پس منظر اور حرکت" });
    await bgSummary.click();
    for (const bg of ["girih", "rosette", "hexagonal", "mihrab", "night_dome"]) {
      await page.getByLabel(/پس منظر انداز/).selectOption(bg);
      await page.waitForTimeout(400);
      await page.locator("canvas").first().screenshot({
        path: path.join(OUT_DIR, `bg-${bg}.png`),
      });
    }

    // 3. Export MP4 with AI Voiceover (mocked /api/tts) on 1:1
    const voiceSummary = page.locator("summary", { hasText: "آواز (اردو وائس اوور)" });
    await voiceSummary.click();
    await page.getByRole("button", { name: "AI ترجمہ آواز" }).click();
    await page.waitForTimeout(300);

    const exportBtn = page.getByRole("button", { name: /MP4 ڈاؤن لوڈ کریں|Download MP4/i });
    await exportBtn.click();
    const mp4Link = page.locator('a[download$=".mp4"]');
    await mp4Link.waitFor({ state: "visible", timeout: 90000 });
    const filename = await mp4Link.getAttribute("download");
    const [dl] = await Promise.all([
      page.waitForEvent("download", { timeout: 15000 }),
      mp4Link.click(),
    ]);
    const mp4Path = path.join(OUT_DIR, filename || "ai-voice-test.mp4");
    await dl.saveAs(mp4Path);
    const stat = fs.statSync(mp4Path);
    console.log(`Exported AI Voice MP4: ${mp4Path} (${stat.size} bytes)`);
    if (stat.size < 20000) throw new Error("AI Voice MP4 too small");

    await browser.close();
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
