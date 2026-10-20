import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

/**
 * E2E contra el build de producción (`pnpm build` antes). En este entorno solo
 * hay Chromium preinstalado: WebKit y Firefox se activan con PW_ALL_BROWSERS=1
 * cuando estén instalados (`pnpm exec playwright install webkit firefox`).
 */
const PORT = Number(process.env.E2E_PORT ?? 3300);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const localChromium = process.env.PW_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const chromiumLaunch = existsSync(localChromium)
  ? {
      executablePath: localChromium,
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    }
  : {};

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  outputDir: '../test-results',
  use: {
    baseURL: BASE_URL,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next start -p ${PORT}`,
        cwd: '..',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: { LEADS_MOCK: '1' },
      },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: chromiumLaunch } },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'], launchOptions: chromiumLaunch },
      grep: /@mobile/,
    },
    ...(process.env.PW_ALL_BROWSERS === '1'
      ? [
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        ]
      : []),
  ],
});
