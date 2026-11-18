import { spawn } from "node:child_process";
import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";

const PORT = 5056;
const BASE_URL = `http://localhost:${PORT}`;

const ROUTES = ["/ur/", "/ur/guide", "/ur/verses/3-159", "/ur/studio"];

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
  throw new Error("Preview server did not start");
}

async function main() {
  const server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    { stdio: "ignore" }
  );
  const browser = await chromium.launch({
    args: ["--remote-debugging-port=9222"],
  });

  try {
    await waitForServer(`${BASE_URL}/ur/`);
    let failed = false;

    for (const route of ROUTES) {
      const runnerResult = await lighthouse(`${BASE_URL}${route}`, {
        port: 9222,
        output: "json",
        logLevel: "error",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      });

      const cats = runnerResult.lhr.categories;
      const scores = {
        perf: Math.round((cats.performance.score || 0) * 100),
        a11y: Math.round((cats.accessibility.score || 0) * 100),
        bp: Math.round((cats["best-practices"].score || 0) * 100),
        seo: Math.round((cats.seo.score || 0) * 100),
      };

      console.log(`Lighthouse ${route}:`, scores);
      if (scores.perf < 90 || scores.a11y < 95 || scores.bp < 95 || scores.seo < 100) {
        failed = true;
      }
    }

    if (failed) {
      console.error("Lighthouse thresholds not met (90 / 95 / 95 / 100).");
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
