import { test, expect, setFakeDateStorage, clearFakeDateStorage } from './fixtures'
import { ServiceWorker } from 'playwright-core'

const TEST_ORIGIN = 'https://example.com'
const FAKE_DATE = '2020-06-15T12:00:00.000Z'

/**
 * バッジテキストとタイトルからアイコン状態を取得する
 */
async function getIconState(background: ServiceWorker, tabId: number) {
  return background.evaluate(async (tabId: number) => {
    const badgeText = await chrome.action.getBadgeText({ tabId })
    const title = await chrome.action.getTitle({ tabId })
    return { badgeText, title }
  }, tabId)
}

/**
 * アイコンが enabled 状態であることを検証する
 */
async function expectIconEnabled(background: ServiceWorker, tabId: number) {
  const state = await getIconState(background, tabId)
  expect(state.badgeText).toBe('ON')
  expect(state.title).toContain('Fake Date (')
  expect(state.title).not.toContain('OFF')
}

/**
 * アイコンが disabled 状態であることを検証する
 */
async function expectIconDisabled(background: ServiceWorker, tabId: number) {
  const state = await getIconState(background, tabId)
  expect(state.badgeText).toBe('')
  expect(state.title).toBe('Fake Date (OFF)')
}

test.afterEach(async ({ context, background }) => {
  await clearFakeDateStorage(background, TEST_ORIGIN)
  // テスト間でページをクリーンアップ（デフォルトの about:blank 以外を閉じる）
  const pages = context.pages()
  for (let i = pages.length - 1; i >= 1; i--) {
    await pages[i].close()
  }
})

test.describe('Icon badge', () => {
  test('初期状態（設定なし）のときアイコンが disabled になる', async ({
    context,
    background,
  }) => {
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)
    await page.waitForTimeout(500)

    const tabId = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconDisabled(background, tabId)
  })

  test('ON にしたときアイコンが enabled になる', async ({
    context,
    background,
  }) => {
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: FAKE_DATE,
    })
    await page.waitForTimeout(500)

    const tabId = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconEnabled(background, tabId)
  })

  test('ON の状態でリロードしたときアイコンが enabled のまま', async ({
    context,
    background,
  }) => {
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: FAKE_DATE,
    })
    await page.waitForTimeout(500)

    await page.reload()
    await page.waitForTimeout(500)

    const tabId = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconEnabled(background, tabId)
  })

  test('OFF にしたときアイコンが disabled になる', async ({
    context,
    background,
  }) => {
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    // 一度 ON にする
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: FAKE_DATE,
    })
    await page.waitForTimeout(500)

    // OFF にする
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: false,
      date: FAKE_DATE,
    })
    await page.waitForTimeout(500)

    const tabId = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconDisabled(background, tabId)
  })

  test('OFF の状態でリロードしたときアイコンが disabled のまま', async ({
    context,
    background,
  }) => {
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    // 一度 ON → OFF にする
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: FAKE_DATE,
    })
    await page.waitForTimeout(500)
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: false,
      date: FAKE_DATE,
    })
    await page.waitForTimeout(500)

    await page.reload()
    await page.waitForTimeout(500)

    const tabId = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconDisabled(background, tabId)
  })

  test('ON の状態で別タブに同サイトを開いたときアイコンが enabled になる', async ({
    context,
    background,
  }) => {
    const page1 = await context.newPage()
    await page1.goto(TEST_ORIGIN)

    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: FAKE_DATE,
    })
    await page1.waitForTimeout(500)

    // 別タブで同サイトを開く
    const page2 = await context.newPage()
    await page2.goto(TEST_ORIGIN)
    await page2.waitForTimeout(500)

    const tabId = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ active: true, url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconEnabled(background, tabId)
  })

  test('OFF の状態で別タブに同サイトを開いたときアイコンが disabled になる', async ({
    context,
    background,
  }) => {
    const page1 = await context.newPage()
    await page1.goto(TEST_ORIGIN)

    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: false,
      date: FAKE_DATE,
    })
    await page1.waitForTimeout(500)

    // 別タブで同サイトを開く
    const page2 = await context.newPage()
    await page2.goto(TEST_ORIGIN)
    await page2.waitForTimeout(500)

    const tabId = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ active: true, url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconDisabled(background, tabId)
  })

  test('ON にしたとき別タブの同サイトもアイコンが enabled になる', async ({
    context,
    background,
  }) => {
    const page1 = await context.newPage()
    await page1.goto(TEST_ORIGIN)
    const page2 = await context.newPage()
    await page2.goto(TEST_ORIGIN)
    await page2.waitForTimeout(500)

    // ON にする（storage.onChanged で全タブに反映される）
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: FAKE_DATE,
    })
    await page2.waitForTimeout(500)

    // page1 のタブのアイコンを確認
    const tab1Id = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconEnabled(background, tab1Id)

    // page2（アクティブタブ）のアイコンも確認
    const tab2Id = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ active: true, url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconEnabled(background, tab2Id)
  })

  test('OFF にしたとき別タブの同サイトもアイコンが disabled になる', async ({
    context,
    background,
  }) => {
    const page1 = await context.newPage()
    await page1.goto(TEST_ORIGIN)
    const page2 = await context.newPage()
    await page2.goto(TEST_ORIGIN)

    // 一度 ON にする
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: FAKE_DATE,
    })
    await page2.waitForTimeout(500)

    // OFF にする
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: false,
      date: FAKE_DATE,
    })
    await page2.waitForTimeout(500)

    // page1 のタブのアイコンを確認
    const tab1Id = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconDisabled(background, tab1Id)

    // page2（アクティブタブ）のアイコンも確認
    const tab2Id = await background.evaluate(async (origin: string) => {
      const tabs = await chrome.tabs.query({ active: true, url: `${origin}/*` })
      return tabs[0]?.id!
    }, TEST_ORIGIN)

    await expectIconDisabled(background, tab2Id)
  })
})
