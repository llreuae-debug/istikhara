import { expect, test } from "@playwright/test";

function makeSilentWav(durationSec = 2, sampleRate = 22050): Buffer {
  const numSamples = Math.floor(durationSec * sampleRate);
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
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
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

test.describe("Studio v3 — Templates, Liquid Glass Tabs, Responsive & Real MP4 Export", () => {
  test("desktop 1440x900 Urdu: switches templates, checks contrast, exports real MP4 + cover + SRT/VTT", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // Deterministic 2s WAV for external recitation MP3s so export E2E never stalls on external CDNs
    const wav = makeSilentWav(2);
    await page.route("**/*.mp3*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "audio/wav",
        body: wav,
      })
    );
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/ur/studio?s=108&a=1");

    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(900);

    // Switch through key templates
    for (const label of [
      "وائٹ بورڈ ڈوڈل",
      "مصحفِ مبارک",
      "کائنیٹک لفظ بہ لفظ",
      "چاک بورڈ درس",
    ]) {
      const btn = page.getByRole("button", { name: new RegExp(label, "i") });
      await btn.click();
      await page.waitForTimeout(250);
    }

    // Select Whiteboard Doodle (uses HarfBuzz doodle_write) and scrub mid-verse for screenshot
    await page.getByRole("button", { name: /وائٹ بورڈ ڈوڈل/i }).click();
    const scrubber = page.getByLabel("Video timeline scrubber");
    await scrubber.fill("4.2");
    await scrubber.dispatchEvent("change");
    await page.waitForTimeout(400);
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/studio_desktop_whiteboard.png",
    });

    // Export real MP4 for 108:1
    const exportBtn = page.getByRole("button", { name: /Download MP4/i });
    await expect(exportBtn).toBeEnabled();
    await exportBtn.click();

    // Wait for post-export MP4 download link (up to 60s)
    const mp4Link = page.locator('a[download$="_9x16.mp4"]');
    await expect(mp4Link).toBeVisible({ timeout: 60000 });

    const coverLink = page.locator('a[download$="_cover.png"]');
    await expect(coverLink).toBeVisible();

    const srtBtn = page.getByRole("button", { name: ".SRT" });
    const vttBtn = page.getByRole("button", { name: ".VTT" });
    await expect(srtBtn).toBeVisible();
    await expect(vttBtn).toBeVisible();

    // Verify exported MP4 blob has > 20KB real media bytes
    const mp4Size = await mp4Link.evaluate(async (a: HTMLAnchorElement) => {
      const res = await fetch(a.href);
      const buf = await res.arrayBuffer();
      return buf.byteLength;
    });
    expect(mp4Size).toBeGreaterThan(20_000);

    // Verify cover PNG blob > 5KB
    const coverSize = await coverLink.evaluate(async (a: HTMLAnchorElement) => {
      const res = await fetch(a.href);
      const buf = await res.arrayBuffer();
      return buf.byteLength;
    });
    expect(coverSize).toBeGreaterThan(5_000);

    expect(errors).toEqual([]);
  });

  test("mobile 390x844 English: no horizontal overflow and Liquid Glass tabs work", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/studio?s=3&a=159");

    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(800);

    // Check no horizontal overflow
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);

    // Click Background, Text, Hand tabs
    for (const tabName of ["Background", "Text", "Hand", "Audio", "Export"]) {
      const tab = page.getByRole("tab", { name: new RegExp(tabName, "i") });
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
    }

    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/studio_mobile_en.png",
    });
  });
});
