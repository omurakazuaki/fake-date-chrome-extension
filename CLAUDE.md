# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development mode with hot reload
npm run build        # TypeScript check + production build
npm run lint         # ESLint
npm run test:e2e     # Build extension and run Playwright E2E tests
npm run package      # Build and create distributable .zip
```

E2E tests use Playwright with the built extension loaded from `./dist`. There is also a `/e2e-verify` skill available for running E2E verification via Playwright MCP.

## Architecture

This is a Chrome Extension (Manifest V3) that mocks `window.Date` to return arbitrary dates, useful for testing time-dependent web features.

### Three-Layer Structure

**1. Background Service Worker** (`src/background/index.ts`)
Listens to Chrome events and orchestrates injection:
- `webNavigation.onCommitted` — injects FakeDate before page scripts run (earliest possible point)
- `tabs.onActivated` — re-injects when switching tabs
- `storage.onChanged` — re-injects when popup settings change

Injection uses `chrome.scripting.executeScript` with `world: 'MAIN'` to run in the page's JS context (not the isolated extension context), and `injectImmediately: true` to beat user scripts.

**2. Core Library** (`src/lib/fake-date.ts`)
Exposes `window.__FakeDate.inject(startingTime, timeSpeed)` and `window.__FakeDate.remove()`. Replaces `window.Date` with a fake constructor that offsets time relative to a `startingTime` baseline.

**3. Popup UI** (`src/popup/`)
React 19 + Material-UI. State managed via `useForm.ts` (local form state) and `useStorage.ts` (Chrome storage read/write). Settings are persisted per-origin (domain).

### Time-Lapse Modes

The `startingTime` passed to `inject()` determines behavior:
- **STOP**: `startingTime = -1` → `Date.now()` always returns the configured date
- **RESET**: `startingTime = Date.now()` at page load → clock runs from configured date, restarting each page load
- **KEEP**: `startingTime = setting.startingTime` (when setting was saved) → clock runs continuously from when the setting was applied

### Storage Schema

Chrome `storage.local` keys:
- Origin string (e.g., `"https://example.com"`) → `Setting` object
- `"dateHistory_{origin}"` → `HistoryItem[]` (recently used dates)

See `src/types.ts` for the `Setting`, `Settings`, and `History` types.

### Build

Vite + `@crxjs/vite-plugin` handles Chrome extension packaging. The manifest is defined in `vite.config.ts`. MUI chunks are split for optimization. Output goes to `dist/`.

## Development Guidelines

### Design Principles

- Follow SOLID principles: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
- Refactor as needed, but always add tests first to ensure existing behavior is preserved before refactoring.

### Development Workflow

1. **Update docs and tests first** — Before starting implementation, update relevant documentation (this CLAUDE.md, README, etc.) and E2E tests.
2. **Implement** — Write code to make the tests pass.
3. **Quality checks** — After implementation, run the following:
   - `npm run build` — TypeScript type checking + production build
   - `npm run lint` — ESLint static analysis
   - `npm run test:e2e` — Playwright E2E tests
4. **Browser verification** — When needed, use Playwright MCP (`/e2e-verify` skill) to verify behavior in the browser.
