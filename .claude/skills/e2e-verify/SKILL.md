---
name: e2e-verify
description: >-
  Playwright MCPを使ってFake Date拡張機能のE2E動作検証を実行する。
  テストページを起動し、ブラウザ上で拡張機能の各モード（STOP/RESET/OFF）を検証する。
  Trigger on: 動作検証, E2Eテスト, 拡張機能テスト, ブラウザテスト
---

# Fake Date 拡張機能 E2E動作検証

Playwright MCPを使って、Fake Date Chrome拡張機能の動作をブラウザ上で検証する手順。

## 前提条件

- Playwright MCP サーバーが設定済み（`playwright-mcp.config.json`）
- `dist/` がビルド済み（未ビルドなら `npm run build` を実行）
- テストページ（`test-page/`）が利用可能

## 検証手順

### Step 1: ビルド

```bash
npm run build
```

### Step 2: テストページの起動

```bash
npx vite --config vite.config.test.ts --port 5174 &
```

テストページは `http://localhost:5174` で起動する。

### Step 3: ブラウザを開いてテストページに遷移

Playwright MCP の `browser_navigate` で `http://localhost:5174` にアクセスする。

### Step 4: 拡張機能のService Workerを取得

`browser_run_code` を使ってService Workerコンテキストを取得する。

```javascript
async (page) => {
  const context = page.context();
  const serviceWorkers = context.serviceWorkers();
  return serviceWorkers.map(sw => sw.url());
}
```

拡張機能のService Worker URL が `chrome-extension://<ID>/service-worker-loader.js` の形式で返される。

### Step 5: chrome.storageを通じて設定を書き込む

`chrome-extension://` URLには直接アクセスできないため、Service Workerの `evaluate` を使ってchrome.storageに設定を書き込む。

**ストレージのキー**: オリジンそのもの（例: `http://localhost:5174`）
**設定値の型**:

```typescript
{
  enabled: boolean,      // 有効/無効
  date: string,          // ISO 8601形式の日時（例: '2000-01-01T00:00:00'）
  timeLapse: string,     // 'STOP' | 'RESET' | 'KEEP'
  autoReload: boolean,   // 自動リロード
  startingTime: number   // Date.now() のタイムスタンプ
}
```

**設定書き込みのコード例**:

```javascript
async (page) => {
  const context = page.context();
  const sw = context.serviceWorkers()[0];

  const result = await sw.evaluate(() => {
    return new Promise((resolve) => {
      const origin = 'http://localhost:5174';
      const setting = {
        enabled: true,
        date: '2000-01-01T00:00:00',
        timeLapse: 'STOP',
        autoReload: true,
        startingTime: Date.now()
      };
      chrome.storage.local.set({ [origin]: setting }, () => {
        resolve({ success: true });
      });
    });
  });

  return result;
}
```

### Step 6: ページのスナップショットで検証

`browser_snapshot` でページの状態を取得し、表示日時が設定した日時になっていることを確認する。

テストページには以下が表示される:
- **メイン表示**: `new Date()` の結果（Fake Dateが適用される）
- **real now**: `Date.real` 経由の実際の日時（Fake Dateの影響を受けない）

### Step 7: 各モードの検証

以下の3パターンを順に検証する:

| テスト | timeLapse | 確認ポイント |
|--------|-----------|-------------|
| **時刻固定** | `STOP` | 表示時刻が設定値に固定され、秒が進まない |
| **時間経過** | `RESET` | 設定日時から秒が進行する |
| **無効化** | `enabled: false` | 実際の日時が表示される（real nowと一致） |

### Step 8: クリーンアップ

テストページのdevサーバーを停止する。

```bash
pkill -f "vite --config vite.config.test.ts"
```

## 注意事項

- `chrome-extension://` URLはPlaywright MCPでは直接アクセスできない。ポップアップUIの操作はService Worker経由のストレージ操作で代替する。
- `autoReload: true` を設定すると、ストレージ変更後にページが自動リロードされるため、スナップショット取得前に少し待つ必要がある場合がある。
- 拡張機能IDはプロファイルディレクトリ `.playwright-mcp-profile/Default/Local Extension Settings/` 配下で確認できる。
