# Fake Date Chrome Extension

A Chrome extension that mocks JavaScript's Date object.
Useful for testing time-dependent features in web applications.

## Key Features

- **Date Mocking**: Overrides JavaScript's `Date` object to return any date and time you specify
- **Fine-Grained Control**: Set year, month, day, hour, minute, and second
- **Per-Site Settings**: Save and manage different settings for each origin (domain)
- **Time Speed Control**: Adjust how fast the clock moves — pause (0), slow-motion (<1), normal (1), or fast-forward (>1)
- **Intuitive UI**: Material-UI based popup interface
- **Badge Indicator**: Check the current mock status from the extension icon

## Technical Details

### Settings

The following settings are saved per site:

- **Enabled/Disabled (enabled)**: Toggle Date mocking on/off
- **Base Date (date)**: The date and time to mock (ISO 8601 format)
- **Auto Reload (autoReload)**: Automatically reload the page when settings change
- **Time Speed (timeSpeed)**: Multiplier for clock speed (0 = frozen, 1 = normal, 2 = double speed, etc.)
- **Time-Lapse Mode (timeLapse)**:
  - `RESET`: Resets the clock from the configured date on each page reload
  - `KEEP`: Maintains elapsed time from when the setting was originally applied

### How It Works

1. **Background Script** (`src/background/index.ts`)
   - Monitors tab switches and page navigation
   - Loads saved settings from Chrome Storage API
   - Injects the fake-date script into pages using `chrome.scripting.executeScript` with `world: 'MAIN'`

2. **Fake Date Core** (`src/lib/fake-date.ts`)
   - Wraps `window.Date` to create a mock Date object
   - Overrides both `Date.now()` and `new Date()`
   - Applies time speed multiplier to control clock progression
   - Stores inject/remove functions on `window.__FakeDate`

3. **Popup UI** (`src/popup/`)
   - Built with Material-UI components
   - Manages settings for the current tab's origin
   - Syncs with Chrome Storage API via React Hooks

### Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite + @crxjs/vite-plugin
- **UI Library**: Material-UI (MUI)
- **Date Handling**: Day.js
- **E2E Testing**: Playwright

## Development Commands

```bash
# Development mode (hot reload)
npm run dev

# Build
npm run build

# Watch mode
npm run watch

# Lint
npm run lint

# E2E tests
npm run test:e2e

# Package for distribution
npm run package
```

## Installation

1. Build with `npm run build`
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

## Usage

1. Open the website you want to test
2. Click the extension icon
3. Toggle the switch on and select the desired date and time
4. Adjust the time speed if needed (0 to freeze, >1 to fast-forward)
5. Choose a time-lapse mode (Reset or Keep)
6. Enable auto-reload for instant application

Icon colors indicate mock status:
- Color icon: Mock active
- Gray icon: Mock inactive

## Permissions

This extension requires the following permissions:

- **`storage`**: Stores per-site settings (date, enabled/disabled, etc.) locally
- **`scripting`**: Injects the Date mocking script into pages
- **`webNavigation`**: Automatically applies mocking on page load
- **`<all_urls>`**: Required to enable Date mocking on all websites

**Privacy Policy**: This extension does not send any data externally. All settings are stored locally in your browser.

## Security

- Content Security Policy (CSP) implemented to protect against XSS attacks
- User input is properly sanitized
- No external communication (fully local operation)
- Open source and auditable