import { test, expect, clearFakeDateStorage } from './fixtures'
import type { Worker, BrowserContext } from '@playwright/test'

const TEST_ORIGIN = 'https://example.com'

/**
 * ポップアップを開く
 *
 * Playwright でポップアップを新規タブとして開く場合、タブ自身がアクティブタブになるため
 * chrome.tabs.query({active:true}) でターゲットページの URL を取れない。
 * addInitScript で chrome.tabs.query をモックして正しい origin を返すようにする。
 */
async function openExtensionPopup(
  background: Worker,
  context: BrowserContext,
  targetOrigin: string,
) {
  const extensionId = background.url().split('/')[2]
  const popupUrl = `chrome-extension://${extensionId}/src/popup/index.html`
  const popup = await context.newPage()

  // chrome.tabs.query をモックして targetOrigin をアクティブタブの URL として返す
  await popup.addInitScript((origin: string) => {
    const origQuery = chrome.tabs.query.bind(chrome.tabs)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(chrome.tabs as any).query = (
      queryInfo: chrome.tabs.QueryInfo,
      callback: (tabs: chrome.tabs.Tab[]) => void,
    ) => {
      if (queryInfo.active) {
        callback([{ url: origin, id: 9999 } as chrome.tabs.Tab])
      } else {
        origQuery(queryInfo, callback)
      }
    }
  }, targetOrigin)

  await popup.goto(popupUrl)
  await popup.waitForLoadState('load')
  // React の状態更新 (useEffect) を待つ
  await popup.waitForTimeout(300)
  return popup
}

test.afterEach(async ({ background }) => {
  await clearFakeDateStorage(background, TEST_ORIGIN)
})

test.describe('Popup UI', () => {
  test('ポップアップが開いて UI が表示される', async ({
    context,
    background,
  }) => {
    const popup = await openExtensionPopup(background, context, TEST_ORIGIN)

    // オリジン（example.com）が表示されること
    await expect(popup.getByText(TEST_ORIGIN)).toBeVisible()

    // デフォルトは Disabled 状態
    await expect(popup.getByText('Disabled')).toBeVisible()
  })

  test('スイッチで FakeDate を有効化できる', async ({
    context,
    background,
  }) => {
    const popup = await openExtensionPopup(background, context, TEST_ORIGIN)
    await expect(popup.getByText(TEST_ORIGIN)).toBeVisible()

    // スイッチをオンにする（MUI Switch は内部 input が opacity:0 のため label をクリック）
    await popup.locator('label').click()

    // Enabled に切り替わる
    await expect(popup.getByText('Enabled')).toBeVisible()

    // 日付入力・時間入力・Apply ボタンが表示される
    await expect(popup.getByRole('group', { name: 'Date' })).toBeVisible()
    await expect(popup.getByRole('group', { name: 'Time' })).toBeVisible()
    await expect(popup.getByRole('button', { name: 'Apply' })).toBeVisible()
  })

  test('日付を設定して Apply するとストレージに保存される', async ({
    context,
    background,
  }) => {
    const popup = await openExtensionPopup(background, context, TEST_ORIGIN)
    await expect(popup.getByText(TEST_ORIGIN)).toBeVisible()

    // FakeDate を有効化（MUI Switch は内部 input が opacity:0 のため label をクリック）
    await popup.locator('label').click()
    await expect(popup.getByText('Enabled')).toBeVisible()

    // 日付を入力: DatePicker の各セクション（年/月/日）にキーボードで入力
    await popup.getByRole('group', { name: 'Date' }).click()
    await popup.keyboard.type('20200615')

    // 時刻を入力: TimePicker の各セクション（時/分/秒）にキーボードで入力
    await popup.getByRole('group', { name: 'Time' }).click()
    await popup.keyboard.type('120000')

    // Keep モードを選択
    await popup.getByLabel('Keep').click()

    // Apply ボタンをクリック
    await popup.getByRole('button', { name: 'Apply' }).click()
    await popup.waitForTimeout(300)

    // ストレージに設定が保存されたか確認
    const stored = await background.evaluate(async (origin: string) => {
      const result = await chrome.storage.local.get(origin)
      return result[origin]
    }, TEST_ORIGIN)

    expect(stored).toBeDefined()
    expect(stored.enabled).toBe(true)
    expect(stored.timeLapse).toBe('KEEP')
    expect(stored.date).toContain('2020-06-15')
  })

  test('timeSpeed を 0 に設定して Apply すると timeSpeed: 0 で保存される', async ({
    context,
    background,
  }) => {
    const popup = await openExtensionPopup(background, context, TEST_ORIGIN)
    await popup.locator('label').click()
    await expect(popup.getByText('Enabled')).toBeVisible()

    // timeSpeed 入力欄をクリアして 0 を入力
    const timeSpeedInput = popup.getByLabel('Time speed (x0 = stop)')
    await timeSpeedInput.click()
    await timeSpeedInput.fill('0')

    // Apply ボタンをクリック
    await popup.getByRole('button', { name: 'Apply' }).click()
    await popup.waitForTimeout(300)

    const stored = await background.evaluate(async (origin: string) => {
      const result = await chrome.storage.local.get(origin)
      return result[origin]
    }, TEST_ORIGIN)

    expect(stored).toBeDefined()
    expect(stored.enabled).toBe(true)
    expect(stored.timeSpeed).toBe(0)
  })

  test('timeSpeed を 10 に設定して Apply すると timeSpeed: 10 で保存される', async ({
    context,
    background,
  }) => {
    const popup = await openExtensionPopup(background, context, TEST_ORIGIN)
    await popup.locator('label').click()
    await expect(popup.getByText('Enabled')).toBeVisible()

    // timeSpeed 入力欄をクリアして 10 を入力
    const timeSpeedInput = popup.getByLabel('Time speed (x0 = stop)')
    await timeSpeedInput.click()
    await timeSpeedInput.fill('10')

    // Apply ボタンをクリック
    await popup.getByRole('button', { name: 'Apply' }).click()
    await popup.waitForTimeout(300)

    const stored = await background.evaluate(async (origin: string) => {
      const result = await chrome.storage.local.get(origin)
      return result[origin]
    }, TEST_ORIGIN)

    expect(stored).toBeDefined()
    expect(stored.enabled).toBe(true)
    expect(stored.timeSpeed).toBe(10)
  })

  test('既存の設定が有効化されている場合、ポップアップに反映される', async ({
    context,
    background,
  }) => {
    // あらかじめ設定を保存しておく
    await background.evaluate(async (origin: string) => {
      await chrome.storage.local.set({
        [origin]: {
          enabled: true,
          date: '2019-03-20T08:30:00.000Z',
          timeLapse: 'RESET',
          timeSpeed: 1,
          autoReload: false,
          startingTime: Date.now(),
        },
      })
    }, TEST_ORIGIN)

    const popup = await openExtensionPopup(background, context, TEST_ORIGIN)

    // Enabled 状態で表示される
    await expect(popup.getByText('Enabled')).toBeVisible()
    // 日付入力が表示される
    await expect(popup.getByRole('group', { name: 'Date' })).toBeVisible()
  })
})
