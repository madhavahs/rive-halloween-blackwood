import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "apps/web/tests",
  webServer: { command: "npm run dev", port: 5173, reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true } }
  ]
});
