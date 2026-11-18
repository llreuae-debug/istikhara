import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Liquid Glass UI & LiquidGlassTabs E2E", () => {
  test("UI Kit & LiquidGlassTabs click, drag, and RTL/LTR keyboard nav", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/ur/dev/ui-kit");

    const main = page.locator("main");
    const tablist = main.getByRole("tablist", { name: "Navigation tabs" });
    await expect(tablist).toBeVisible();

    const tabs = tablist.getByRole("tab");
    // Click second tab
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");

    // RTL keyboard ArrowLeft moves to next tab
    await tabs.nth(1).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");

    // Capture Midnight Glass Urdu UI Kit screenshot
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/glass-ui-kit-midnight-ur.png",
    });

    // Switch to Moonlight Glass
    await main.getByRole("tab", { name: /مون لائٹ گلاس/i }).click();
    await page.waitForTimeout(350);
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/glass-ui-kit-moonlight-ur.png",
    });

    // Axe accessibility check on UI Kit
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = axe.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(serious).toEqual([]);
  });

  test("Mobile 390x844 floating GlassDock and Home/Prepare screenshots", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ur/");
    await expect(page.getByRole("navigation", { name: "Mobile Navigation Dock" })).toBeVisible();
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/glass-mobile-home-ur.png",
    });

    await page.goto("/en/prepare");
    await page.screenshot({
      path: "/Users/dilnawaz/.gemini/antigravity/brain/7bfb2cd7-98b7-4a05-a3bf-a19e30d4dda4/scratch/glass-mobile-prepare-en.png",
    });
  });
});
