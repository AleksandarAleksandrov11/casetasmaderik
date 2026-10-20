import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

/**
 * QA visual y técnico (sección 20). Requiere el build de QA:
 *   pnpm build:qa && pnpm qa:screens
 * WebKit y Firefox se añaden con PW_ALL_BROWSERS=1 si están instalados.
 */
const PORT = Number(process.env.E2E_PORT ?? 3300);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const localChromium = process.env.PW_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const launchOptions = existsSync(localChromium)
  ? {
      executablePath: localChromium,
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    }
  : {};

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts$/,
  timeout: 120_000,
  fullyParallel: true,
  workers: Number(process.env.QA_WORKERS ?? 3),
  reporter: [['list'], ['json', { outputFile: 'output/qa-results.json' }]],
  outputDir: './output/test-results',
  use: { baseURL: BASE_URL, locale: 'es-ES', timezoneId: 'Europe/Madrid', actionTimeout: 15_000 },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next start -p ${PORT}`,
        cwd: '../..',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: { LEADS_MOCK: '1', VERCEL_JSON_LOCAL: '1' },
      },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', launchOptions } },
    ...(process.env.PW_ALL_BROWSERS === '1'
      ? [
          { name: 'webkit', use: { browserName: 'webkit' as const } },
          { name: 'firefox', use: { browserName: 'firefox' as const } },
        ]
      : []),
  ],
});
