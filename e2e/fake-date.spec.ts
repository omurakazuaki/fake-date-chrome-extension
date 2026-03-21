import { test, expect, setFakeDateStorage, clearFakeDateStorage } from './fixtures'

const TEST_ORIGIN = 'https://example.com'

test.afterEach(async ({ background }) => {
  await clearFakeDateStorage(background, TEST_ORIGIN)
})

test.describe('FakeDate injection', () => {
  test('timeSpeed=0: 指定した日時で Date が固定される', async ({
    context,
    background,
  }) => {
    const fakeDate = '2020-06-15T12:00:00.000Z'

    // ページを開いてから storage.onChanged で注入する
    // （webNavigation.onCommitted の非同期処理とのレース回避）
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: fakeDate,
      timeSpeed: 0,
    })

    // storage.onChanged → executeScript が完了するまで待機
    await page.waitForTimeout(500)

    const result = await page.evaluate(() => {
      return {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        // timeSpeed=0 では Date.now() が変化しない
        nowA: Date.now(),
        nowB: Date.now(),
      }
    })

    expect(result.year).toBe(2020)
    expect(result.month).toBe(6)
    expect(result.day).toBe(15)
    // timeSpeed=0 では Date.now() が変化しない（同一タスク内）
    expect(result.nowA).toBe(result.nowB)
  })

  test('RESET モード: 指定した日時から時間が経過する', async ({
    context,
    background,
  }) => {
    const fakeDate = '2020-01-01T00:00:00.000Z'
    const fakeTimestamp = new Date(fakeDate).getTime()

    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: fakeDate,
      timeLapse: 'RESET',
    })

    await page.waitForTimeout(500)

    const result = await page.evaluate((fakeTimestamp) => {
      const now = Date.now()
      // RESET モードでは時間が経過するため fakeTimestamp 以上になる
      return { now, isAfterFakeDate: now >= fakeTimestamp }
    }, fakeTimestamp)

    expect(result.isAfterFakeDate).toBe(true)
    // 実際の年（2026）ではなく 2020 年であることを確認
    const year = new Date(result.now).getFullYear()
    expect(year).toBe(2020)
  })

  test('enabled: false の場合は Date がモックされない', async ({
    context,
    background,
  }) => {
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: false,
      date: '2020-01-01T00:00:00.000Z',
    })

    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    const year = await page.evaluate(() => new Date().getFullYear())
    // 実際の年（2020 ではない）が返ること
    expect(year).toBeGreaterThan(2020)
  })

  test('設定なし（初回訪問）の場合は Date がモックされない', async ({
    context,
  }) => {
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    const year = await page.evaluate(() => new Date().getFullYear())
    expect(year).toBeGreaterThan(2020)
  })

  test('ストレージ変更時に既存タブへ即座に反映される', async ({
    context,
    background,
  }) => {
    const page = await context.newPage()
    await page.goto(TEST_ORIGIN)

    // 初期状態では通常の Date
    const yearBefore = await page.evaluate(() => new Date().getFullYear())
    expect(yearBefore).toBeGreaterThan(2020)

    // ストレージを変更（storage.onChanged リスナーが発火して注入される）
    const fakeDate = '2020-06-15T12:00:00.000Z'
    await setFakeDateStorage(background, TEST_ORIGIN, {
      enabled: true,
      date: fakeDate,
      timeSpeed: 0,
    })

    // FakeDate 注入が完了するまで少し待機
    await page.waitForTimeout(500)

    const yearAfter = await page.evaluate(() => new Date().getFullYear())
    expect(yearAfter).toBe(2020)
  })
})
