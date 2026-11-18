import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Istikhara E2E", () => {
  test("mobile 390x844 full flow + language switch + deep link", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ur/");

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByText("استخارہ شروع کریں")).toBeVisible();

    // Language switch keeps same page
    await page.getByRole("button", { name: /English/i }).click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    // Prepare -> Focus -> Result
    await page.goto("/en/prepare");
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.getByRole("button", { name: /Continue to Focus/i }).click();
    await expect(page).toHaveURL(/\/en\/focus/);

    await page.getByRole("button", { name: /Skip/i }).click();
    await expect(page).toHaveURL(/\/en\/result/);
    await expect(
      page.getByRole("article").getByText("This verse is for reflection")
    ).toBeVisible();

    // Capture mobile result screenshot
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/mobile-result-en.png",
    });

    // Deep link
    await page.goto("/en/ayah/3/159");
    await expect(page.getByText("3:159", { exact: true })).toBeVisible();

    // 9:16 Verse Video Maker (Mode A & Mode B)
    await page.goto("/ur/studio?s=2&a=286");
    await expect(
      page.getByRole("heading", { name: /Quran Verse Video Maker/i })
    ).toBeVisible();
    await page.getByRole("button", { name: "اردو تفسیر" }).click();
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/mobile-studio-916.png",
    });
  });

  test("desktop 1440x900 accessibility (axe)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/ur/");
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/desktop-home-ur.png",
    });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(serious).toEqual([]);
  });

  test("forbidden-zone ad guard, store badges, and settings privacy", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Forbidden zones must never render any [data-ad-slot]
    for (const route of ["/ur/prepare", "/ur/focus", "/ur/dua", "/ur/studio"]) {
      await page.goto(route);
      await page.waitForTimeout(300);
      await expect(page.locator("[data-ad-slot]")).toHaveCount(0);
    }

    // Store badges visible on Home (Google Play / App Store)
    await page.goto("/en/");
    await expect(page.getByText(/Google Play/i).first()).toBeVisible();
    await expect(page.getByText(/App Store/i).first()).toBeVisible();

    // Settings page renders privacy & consent section
    await page.goto("/en/settings");
    await expect(page.getByText(/Privacy/i).first()).toBeVisible();
  });
});
