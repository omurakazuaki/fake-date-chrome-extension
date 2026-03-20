import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: {
    // Chrome 拡張機能のテストは headless: false が必要
    // WSL2 環境では WSLg (Windows 11) または xvfb-run が必要
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
})
