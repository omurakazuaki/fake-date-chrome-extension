import {
  createFakeDate,
  injectFakeDate,
  removeFakeDate,
} from '../lib/fake-date'
import { Setting, Settings } from '../types'

// デバッグログを制御する関数
const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.debug(...args)
  }
}

/**
 * ナビゲーションコミット時のリスナー（最優先）
 *
 * 実行タイミング:
 * - ナビゲーションがコミットされた直後（ドキュメントの読み込み開始前）
 * - ページの最初のHTMLが処理される前に実行される
 *
 * メリット:
 * - 最も早いタイミングでFakeDateを注入できる
 * - ページ内のすべてのJavaScriptより確実に先に実行される
 * - frameType で main_frame（メインフレーム）のみをフィルタリング可能
 *
 * 注意:
 * - webNavigation パーミッションが必要
 * - フレーム内のナビゲーションでも発火するため、frameId === 0 でメインフレームのみに絞る
 */
chrome.webNavigation.onCommitted.addListener((details) => {
  // メインフレームのナビゲーションのみ処理（iframe等を除外）
  if (details.frameId === 0) {
    setupFakeDate(details.tabId)
  }
})

/**
 * タブがアクティブになったときのリスナー
 *
 * 実行タイミング:
 * - ユーザーが別のタブに切り替えたとき
 * - 新しいタブが作成されてアクティブになったとき
 *
 * 処理内容:
 * - アクティブなタブの設定に基づいてバッジ（アイコンとツールチップ）を更新
 * - これにより、タブを切り替えるたびに正しいバッジが表示される
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateBadgeForTab(activeInfo.tabId)
})

/**
 * Chrome Storage（ローカルストレージ）の変更を監視するリスナー
 *
 * 実行タイミング:
 * - ポップアップUIで設定が変更されたとき
 * - chrome.storage.local.set()が呼ばれたとき
 *
 * 処理内容:
 * 1. 変更があったオリジン（ドメイン）を特定
 * 2. 現在開いている全てのタブを取得
 * 3. 変更されたオリジンに一致するタブに対してFakeDateの注入/削除を実行
 * 4. 現在アクティブなタブのバッジを更新（重要：アクティブタブのみ）
 *
 * これにより、設定変更が即座に該当タブに反映されます
 */
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== 'local' || !changes) {
    return
  }
  const origins = Object.keys(changes)
  if (!origins.length) return
  const tabs = await chrome.tabs.query({})

  // 変更されたオリジンに一致する全タブにFakeDateを適用
  tabs.forEach((tab) => {
    if (!tab?.url) return
    const url = new URL(tab.url)
    const setting = changes[url.origin]?.newValue
    if (!setting) return
    executeFakeDateFunction(tab.id!, setting)
  })

  // バッジは現在アクティブなタブの設定で更新（重要）
  const activeTabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })
  if (activeTabs[0]?.id) {
    await updateBadgeForTab(activeTabs[0].id)
  }
})

/**
 * 設定に基づいてFakeDateの注入または削除を実行
 *
 * @param tabId - 対象タブのID
 * @param setting - サイトごとの設定（undefined の場合は削除）
 *
 * 処理:
 * - setting.enabled が true の場合: FakeDateを注入
 * - setting.enabled が false または undefined の場合: FakeDateを削除
 */
function executeFakeDateFunction(tabId: number, setting: Setting | undefined) {
  if (setting?.enabled) {
    executeInjectFakeDate(
      tabId,
      setting.date,
      calculateStartingTime(setting),
      setting.autoReload,
    )
  } else {
    executeRemoveFakeDate(tabId, setting?.autoReload ?? false)
  }
}

/**
 * 拡張機能のバッジ（アイコンとツールチップ）を更新
 *
 * @param setting - 現在の設定
 *
 * 表示内容:
 * - enabled が true: カラーアイコン + "Fake Date (設定日時)"
 * - enabled が false: グレーアイコン + "Fake Date (OFF)"
 *
 * これにより、ユーザーは拡張機能のアイコンを見るだけで
 * 現在のタブでFakeDateが有効かどうかを確認できます
 */
async function updateBadge(tabId: number, setting: Setting | undefined) {
  const { path, title } = setting?.enabled
    ? { path: 'icon128.png', title: `Fake Date (${setting.date})` }
    : { path: 'icon128_disabled.png', title: 'Fake Date (OFF)' }
  chrome.action.setIcon({ path })
  await chrome.action.setIcon({
    tabId,
    path: setting?.enabled ? 'icon128.png' : 'icon128_disabled.png',
  })

  if (setting?.enabled) {
    await chrome.action.setBadgeText({ tabId, text: 'ON' })
    await chrome.action.setBadgeBackgroundColor({
      tabId,
      color: '#4CAF50',
    })
  } else {
    await chrome.action.setBadgeText({ tabId, text: '' })
  }
  chrome.action.setTitle({ title })
}

/**
 * 指定されたタブの設定に基づいてバッジを更新
 *
 * @param tabId - 対象タブのID
 *
 * 処理内容:
 * 1. タブのURLを取得してオリジンを抽出
 * 2. Chrome Storageから該当オリジンの設定を読み込み
 * 3. 設定に基づいてバッジを更新
 *
 * 用途:
 * - タブ切り替え時に正しいバッジを表示
 * - ストレージ変更時に現在のアクティブタブのバッジを更新
 */
async function updateBadgeForTab(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId)
    if (!tab?.url) {
      updateBadge(tabId, undefined)
      return
    }

    const url = new URL(tab.url)
    const origin = url.origin
    const settings = await chrome.storage.local.get<Settings>(origin)
    const setting = settings[origin]
    updateBadge(tabId, setting)
  } catch (error) {
    debug('updateBadgeForTab error:', error)
    updateBadge(tabId, undefined)
  }
}

/**
 * FakeDateオブジェクトを作成してページに注入（初期化用）
 *
 * @param tabId - 対象タブのID
 * @param date - モックする日時（ISO 8601形式の文字列）
 * @param startingTime - 時間経過の起点となるタイムスタンプ
 *
 * 実行内容:
 * - window.__FakeDate オブジェクトを作成
 * - 設定が有効な場合は即座に Date オブジェクトを上書き
 * - world: 'MAIN' を指定することで、ページのメインワールド（通常のJavaScript実行環境）に注入
 * - injectImmediately: true により、ページの他のスクリプトより先に実行
 */
function executeCreateFakeDate(
  tabId: number,
  date: string,
  startingTime: number,
) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: createFakeDate,
    args: [date, startingTime],
    world: 'MAIN',
    injectImmediately: true,
  })
}

/**
 * FakeDateを注入（または再注入）する
 *
 * @param tabId - 対象タブのID
 * @param date - モックする日時（ISO 8601形式の文字列）
 * @param startingTime - 時間経過の起点となるタイムスタンプ
 * @param autoReload - true の場合、注入後にページをリロード
 *
 * 用途:
 * - ユーザーが設定を変更したときに呼ばれる
 * - autoReload が true の場合、変更が即座に反映される
 *
 * 注意: createFakeDate と異なり、既存の __FakeDate を使用して inject() を呼び出す
 */
function executeInjectFakeDate(
  tabId: number,
  date: string,
  startingTime: number,
  autoReload: boolean,
) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: injectFakeDate,
    args: [date, startingTime, autoReload],
    world: 'MAIN',
    injectImmediately: true,
  })
}

/**
 * FakeDateを削除して、オリジナルのDateオブジェクトに戻す
 *
 * @param tabId - 対象タブのID
 * @param autoReload - true の場合、削除後にページをリロード
 *
 * 用途:
 * - ユーザーが設定を無効化したときに呼ばれる
 * - window.Date を元の Date コンストラクタに戻す
 * - autoReload が true の場合、変更が即座に反映される
 */
function executeRemoveFakeDate(tabId: number, autoReload: boolean) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: removeFakeDate,
    args: [autoReload],
    world: 'MAIN',
    injectImmediately: true,
  })
}

/**
 * ページ読み込み時にFakeDateを初期化
 *
 * @param tabId - 対象タブのID
 *
 * 処理フロー:
 * 1. タブ情報を取得してURLからオリジンを抽出
 * 2. Chrome Storageから該当オリジンの設定を読み込み
 * 3. FakeDateオブジェクトを作成（設定が有効な場合は同時に注入）
 * 4. 拡張機能のバッジを更新
 *
 * 実行タイミング:
 * - webNavigation.onCommitted（最優先、最も早い）
 *
 * 重複実行について:
 * - createFakeDate関数内で window.__FakeDate の存在チェックを行っているため、
 *   この関数が複数回呼ばれても問題ありません
 * - 既にセットアップ済みの場合は早期リターンされます
 *
 * 注意: この関数は設定の有効/無効に関わらず、常に __FakeDate オブジェクトを
 * 作成します。これにより、後から設定を変更した際にリロードなしで動作します。
 */
async function setupFakeDate(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId)
    if (!tab?.url) return

    const url = new URL(tab.url)
    const origin = url.origin
    const settings = await chrome.storage.local.get<Settings>(origin)
    const setting = settings[origin]

    executeCreateFakeDate(
      tabId,
      setting?.enabled ? setting.date : '',
      calculateStartingTime(setting),
    )
  } catch (error) {
    // タブが既に閉じられている場合などのエラーを無視
    debug('setupFakeDate error:', error)
  }
}

/**
 * 時間経過モードに基づいて、FakeDateの起点時刻を計算
 *
 * @param setting - サイトごとの設定
 * @returns 起点となるタイムスタンプ（ミリ秒）
 *
 * 時間経過モード:
 * - STOP: -1 を返す（時刻を固定、経過しない）
 *   例: 2023-01-01 12:00:00 に設定すると、常にこの時刻を返す
 *
 * - RESET: Date.now() を返す（現在時刻を起点とする）
 *   例: 2023-01-01 12:00:00 に設定し、10秒後に取得すると 2023-01-01 12:00:10 になる
 *   ページをリロードすると、その時点から再度カウントが始まる
 *
 * - KEEP (default): setting.startingTime を返す（最初に設定した時点を起点とする）
 *   例: 2023-01-01 12:00:00 に設定し、実際の時間で1時間経過すると 2023-01-01 13:00:00 になる
 *   ページをリロードしても、最初の設定時点からの経過時間が維持される
 *
 * 計算式:
 * FakeDate.now() = 設定日時 + (現在時刻 - 起点時刻)
 * ※ STOP モードの場合は (現在時刻 - 起点時刻) が 0 になる
 */
function calculateStartingTime(setting: Setting | undefined) {
  switch (setting?.timeLapse) {
    case 'STOP':
      return -1
    case 'RESET':
      return Date.now()
    default:
      return setting?.startingTime ?? Date.now()
  }
}
