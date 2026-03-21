# Codebase Structure

## Directory Layout

```
/
├── src/
│   ├── types.ts                      # TypeScript type definitions
│   ├── background/
│   │   └── index.ts                  # Background service worker
│   ├── lib/
│   │   └── fake-date.ts              # Core date mocking logic
│   ├── popup/
│   │   ├── index.html                # Popup HTML entry
│   │   ├── main.tsx                  # Popup React app entry
│   │   ├── main.css                  # Popup styles
│   │   ├── components/
│   │   │   └── Form.tsx              # Main settings form component
│   │   └── hooks/
│   │       ├── useStorage.ts         # Chrome storage wrapper hook
│   │       └── useForm.ts            # Form state management hook
│   └── content/                      # Empty (content scripts injected dynamically)
├── public/
│   ├── icon128.png                   # Enabled state icon
│   └── icon128_disabled.png          # Disabled state icon
├── test-page/                        # Local test page for development
│   ├── index.html
│   ├── main.tsx
│   └── App.tsx
├── vite.config.ts                    # Main Vite config with manifest
├── vite.config.test.ts               # Test page Vite config
├── tsconfig.json                     # TypeScript config root
├── tsconfig.app.json                 # App-specific TS config
├── tsconfig.node.json                # Node scripts TS config
├── eslint.config.js                  # ESLint configuration
├── prettier.config.cjs               # Prettier configuration
└── package.json                      # Dependencies and scripts

```

## Key Components

### 1. Background Script (`src/background/index.ts`)
- Monitors tab switches and page navigation
- Reads settings from Chrome Storage
- Injects/removes fake date scripts via `chrome.scripting.executeScript()`
- Updates extension badge based on enabled state
- Key functions:
  - `setupFakeDate()`: Main orchestration
  - `executeCreateFakeDate()`, `executeInjectFakeDate()`, `executeRemoveFakeDate()`
  - `updateBadge()`, `updateBadgeForTab()`
  - `calculateStartingTime()`: Time lapse calculations

### 2. Fake Date Core (`src/lib/fake-date.ts`)
- Pure JavaScript date mocking implementation
- Wraps native `window.Date` with custom implementation
- Exposes global `window.__FakeDate` object with:
  - `createFakeDate()`: Creates mock Date constructor
  - `injectFakeDate()`: Replaces window.Date
  - `removeFakeDate()`: Restores original Date
- Interface `FakeDate` for type safety

### 3. Popup UI (`src/popup/`)
- **main.tsx**: App entry, renders Form component with MUI theme
- **Form.tsx**: Main UI component with:
  - Enable/disable switch
  - Date/time pickers
  - Time lapse mode selector
  - Auto-reload toggle
  - History dropdown
  - Apply button
- **useStorage.ts**: Chrome storage abstraction with history management
- **useForm.ts**: Form state and validation logic

### 4. Types (`src/types.ts`)
- `Setting`: Single origin's configuration
- `Settings`: Map of origin to Setting
- `History`: Map of origin to recent dates
- `HistoryItem`: Single date selection with label