# Architecture and Data Flow

## Overall Architecture

```
┌─────────────────┐
│  Popup UI       │ ← User interaction
│  (React + MUI)  │
└────────┬────────┘
         │ Chrome Storage API
         ↓
┌─────────────────┐
│ Chrome Storage  │ ← Per-origin settings
│ (Local)         │
└────────┬────────┘
         │ storage.onChanged event
         ↓
┌─────────────────┐
│ Background      │ ← Tab events, navigation events
│ Service Worker  │
└────────┬────────┘
         │ chrome.scripting.executeScript()
         ↓
┌─────────────────┐
│ Content Script  │ ← Injected dynamically
│ (fake-date.ts)  │
└────────┬────────┘
         │ Modifies window.Date
         ↓
┌─────────────────┐
│ Web Page        │ ← Uses mocked Date
└─────────────────┘
```

## Data Flow

### 1. User Sets Configuration
1. User opens popup on a website
2. `Form.tsx` renders current settings for the origin
3. User modifies settings (date, time lapse mode, auto-reload)
4. User clicks "Apply" or enables switch
5. `useStorage.ts` saves to `chrome.storage.local`
6. History is updated (max 10 items per origin)

### 2. Background Monitors Changes
1. `chrome.storage.onChanged` event fires
2. Background script reads new settings
3. Calls `setupFakeDate()` for affected tabs
4. Updates badge icon and text

### 3. Script Injection
1. Background determines if fake date should be active
2. If enabled:
   - Calls `executeCreateFakeDate()` with calculated starting time
   - Calls `executeInjectFakeDate()` to replace `window.Date`
3. If disabled:
   - Calls `executeRemoveFakeDate()` to restore original Date

### 4. Page Navigation/Tab Switch
1. `chrome.webNavigation.onCommitted` or `chrome.tabs.onActivated` fires
2. Background fetches settings for new URL's origin
3. Repeats injection process
4. Updates badge for current tab

## Key Design Patterns

### 1. Content Script Injection Strategy
**Not** using traditional content_scripts manifest entry. Instead:
- Scripts injected dynamically via `chrome.scripting.executeScript()`
- Runs in `MAIN` world (same context as page JavaScript)
- This allows direct modification of `window.Date`

### 2. State Management
- **Source of Truth**: Chrome Storage (persisted)
- **UI State**: React hooks (`useState`, `useEffect`)
- **Background State**: Stateless, reads from storage on each event

### 3. Time Lapse Calculation
In `calculateStartingTime()`:
- **RESET**: Returns current timestamp
- **KEEP**: Calculates `originalDate + (now - lastUpdated)`
- **STOP**: Returns original date unchanged

### 4. History Management
- Stored per origin in `history:${origin}` key
- Maximum 10 items (`MAX_HISTORY_SIZE`)
- Newest items first
- Deduplicated by date string

## Chrome APIs Used

### Storage API
- `chrome.storage.local.get()`: Read settings
- `chrome.storage.local.set()`: Write settings
- `chrome.storage.onChanged`: Monitor changes

### Scripting API
- `chrome.scripting.executeScript()`: Inject code
- `target: { tabId, allFrames: true }`: Inject in all frames
- `world: 'MAIN'`: Run in page context

### Web Navigation API
- `chrome.webNavigation.onCommitted`: Detect page loads
- Filters out history navigation

### Tabs API
- `chrome.tabs.onActivated`: Detect tab switches
- `chrome.tabs.query()`: Get current tab info

### Action API (Badge)
- `chrome.action.setBadgeText()`: Set badge text
- `chrome.action.setBadgeBackgroundColor()`: Set badge color
- `chrome.action.setIcon()`: Switch between enabled/disabled icons

## Error Handling
- Try-catch blocks in background script functions
- `debug()` function for console logging
- Silent failures to avoid disrupting user experience
- Chrome API errors logged but not propagated