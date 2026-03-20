import { test as base, chromium, BrowserContext } from '@playwright/test'
import { ServiceWorker } from 'playwright-core'
import path from 'path'

type ExtensionFixtures = {
  context: BrowserContext
  extensionId: string
  background: ServiceWorker
}

/**
 * Chrome 拡張機能をロードした BrowserContext を提供するフィクスチャ
 *
 * 前提: `npm run build` で dist/ ディレクトリが生成済みであること
 */
export const test = base.extend<ExtensionFixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(process.cwd(), 'dist')
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    })
    await use(context)
    await context.close()
  },

  background: async ({ context }, use) => {
    // Service Worker の起動を待機
    let [sw] = context.serviceWorkers()
    if (!sw) {
      sw = await context.waitForEvent('serviceworker')
    }
    await use(sw)
  },

  extensionId: async ({ background }, use) => {
    // Service Worker の URL から拡張機能 ID を取得
    // 例: chrome-extension://abcdefg.../service-worker-loader.js
    const extensionId = background.url().split('/')[2]
    await use(extensionId)
  },
})

export const expect = test.expect

/**
 * 指定したオリジンに FakeDate 設定を chrome.storage.local に保存する
 */
export async function setFakeDateStorage(
  background: ServiceWorker,
  origin: string,
  options: {
    enabled: boolean
    date?: string
    timeLapse?: 'STOP' | 'RESET' | 'KEEP'
    autoReload?: boolean
  },
) {
  const setting = {
    enabled: options.enabled,
    date: options.date ?? new Date().toISOString(),
    timeLapse: options.timeLapse ?? 'STOP',
    autoReload: options.autoReload ?? false,
    startingTime: Date.now(),
  }
  await background.evaluate(
    async ({ origin, setting }) => {
      await chrome.storage.local.set({ [origin]: setting })
    },
    { origin, setting },
  )
}

/**
 * chrome.storage.local を指定オリジンの設定をクリアする
 */
export async function clearFakeDateStorage(
  background: ServiceWorker,
  origin: string,
) {
  await background.evaluate(async (origin) => {
    await chrome.storage.local.remove(origin)
  }, origin)
}
