// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig, devices } from '@playwright/test';

const PUERTO = 5174;

export default defineConfig({
  testDir: 'pruebas/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PUERTO}` },
  webServer: {
    command: 'npm run construir && npm run publicacion',
    url: `http://localhost:${PUERTO}`,
    env: { PORT: String(PUERTO) },
    reuseExistingServer: false,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
