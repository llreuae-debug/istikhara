import { expect, test } from "@playwright/test";

test.describe("Studio Phase 0 — 3:159 preview & VersePicker", () => {
  test("renders 3:159 immediately with non-background pixels in text area and searchable VersePicker", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/ur/studio?s=3&a=159");

    // Wait for canvas to finish loading (skeleton gone)
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(800);

    // Sample pixels inside the safe-zone Arabic/Urdu text box on the 1080x1920 canvas
    const nonBgCount = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d");
      if (!ctx) return 0;
      const img = ctx.getImageData(120, 420, 760, 420).data;
      // Top-left corner pixel as background sample
      const bg = ctx.getImageData(10, 10, 1, 1).data;
      let diffPixels = 0;
      for (let i = 0; i < img.length; i += 4) {
        const d =
          Math.abs(img[i] - bg[0]) +
          Math.abs(img[i + 1] - bg[1]) +
          Math.abs(img[i + 2] - bg[2]);
        if (d > 45) diffPixels++;
      }
      return diffPixels;
    });

    expect(nonBgCount).toBeGreaterThan(200);

    // Verify Surah combobox shows Surah 3
    await expect(
      page.getByRole("combobox", { name: /Surah/i })
    ).toContainText("3 —");

    // Verify Ayah select is bounded to 200 for Surah 3
    const ayahOptions = await page
      .getByLabel(/آیت \/ Ayah/i)
      .locator("option")
      .count();
    expect(ayahOptions).toBe(200);
  });
});
