# Fake Date Chrome Extension

JavaScriptのDateオブジェクトをモック化するためのChrome拡張機能です。
Webアプリケーションの時刻依存の機能をテストする際に便利です。

## 主な機能

- **Dateモックの設定・解除**: JavaScriptの`Date`オブジェクトを上書きして任意の日時を返すようにします
- **日時の細かい設定**: 年月日・時分秒まで指定可能
- **サイトごとの設定保存**: オリジン（ドメイン）ごとに異なる設定を保存・管理
- **直感的なUI**: Material-UIベースのポップアップインターフェイス
- **バッジ表示**: 拡張機能のアイコンで現在の状態を確認可能

## 詳細仕様

### 設定項目

各サイトごとに以下の設定を保存できます：

- **有効/無効 (enabled)**: Dateモックのオン・オフ切り替え
- **基準日時 (date)**: モックで返す日時（ISO 8601形式）
- **自動リロード (autoReload)**: 設定変更時にページを自動的にリロード
- **時間経過モード (timeLapse)**:
  - `RESET`: ページリロード時に現在時刻からリセット
  - `KEEP`: 前回設定時からの経過時間を維持
  - `STOP`: 時刻を固定（経過しない）

### 動作の仕組み

1. **Background Script** (`src/background/index.ts`)
   - タブの切り替えやページの更新を監視
   - Chrome Storage APIで保存された設定を読み込み
   - Content Scriptとして`fake-date.ts`の関数を注入

2. **Fake Date Core** (`src/lib/fake-date.ts`)
   - `window.Date`をラップしてモックDateオブジェクトを作成
   - `Date.now()`と`new Date()`の両方をオーバーライド
   - `window.__FakeDate`にインジェクト/削除機能を格納

3. **Popup UI** (`src/popup/`)
   - Material-UIコンポーネントでUIを構築
   - 現在開いているタブのオリジンに対して設定を管理
   - React HooksでChrome Storage APIと連携

### 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite + @crxjs/vite-plugin
- **UIライブラリ**: Material-UI (MUI)
- **日時処理**: Day.js
- **パッケージマネージャー**: npm/pnpm/yarn

## 開発コマンド

```bash
# 開発モード（ホットリロード）
npm run dev

# ビルド
npm run build

# 監視モード
npm run watch

# リント
npm run lint
```

## インストール方法

1. `npm run build`でビルド
2. Chromeで`chrome://extensions/`を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」から`dist`フォルダを選択

## 使い方

1. テストしたいWebサイトを開く
2. 拡張機能のアイコンをクリック
3. スイッチをオンにして、モックしたい日時を選択
4. 時間経過モードを選択（必要に応じて）
5. 自動リロードをオンにすると即座に反映されます

アイコンの色でモックの状態が確認できます：
- カラーアイコン: モック有効
- グレーアイコン: モック無効
