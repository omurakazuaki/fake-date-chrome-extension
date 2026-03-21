# Fake Date Chrome Extension - Project Overview

## Purpose
This is a Chrome extension that mocks JavaScript's Date object for testing time-dependent functionality in web applications. It allows developers to set arbitrary dates/times and control time flow behavior.

## Tech Stack
- **Frontend Framework**: React 19 with TypeScript 5.9
- **Build Tool**: Vite 7 + @crxjs/vite-plugin (for Chrome extension)
- **UI Library**: Material-UI (MUI) v7 + MUI X Date Pickers
- **Date Handling**: Day.js
- **State Management**: React Hooks + Chrome Storage API (@extend-chrome/storage)
- **Type Checking**: TypeScript with strict type rules
- **Code Quality**: ESLint + Prettier

## Extension Type
Chrome Manifest V3 extension with:
- Background service worker
- Popup UI
- Content script injection (dynamically injected via scripting API)

## Required Permissions
- `storage`: Save settings per origin
- `scripting`: Inject date mocking scripts
- `webNavigation`: Apply mocks on page load
- `<all_urls>`: Mock dates on all websites

## Key Features
1. **Date Mocking**: Override `Date` object to return arbitrary dates
2. **Per-Origin Settings**: Different settings for each website
3. **Time Lapse Modes**:
   - `RESET`: Reset to current time on reload
   - `KEEP`: Maintain elapsed time from last setting
   - `STOP`: Freeze time completely
4. **Auto-reload**: Automatically refresh page when settings change
5. **Badge Indicator**: Visual status on extension icon
6. **History**: Remember recent date selections per origin