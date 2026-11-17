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
});
