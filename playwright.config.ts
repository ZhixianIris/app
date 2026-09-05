import { defineConfig } from '@playwright/test'

// Browser smoke tests run against the PRODUCTION bundle served by `vite preview`.
// The channel is overridable: CI uses the runner's Chrome, local runs can set
// PW_CHANNEL=msedge to reuse an installed Edge.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    channel: process.env.PW_CHANNEL || 'chromium',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
