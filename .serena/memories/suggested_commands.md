# Suggested Commands

## Development
```bash
# Start development server with hot reload
npm run dev

# Start test page for local testing
npm run test:dev
```

## Building
```bash
# Build for production (compiles TypeScript then builds with Vite)
npm run build

# Watch mode (rebuild on file changes)
npm run watch

# Package extension as ZIP file (requires build first)
npm run package
```

## Code Quality
```bash
# Run ESLint on all TypeScript files
npm run lint

# Format code with Prettier (not in package.json, manual command)
npx prettier --write .
```

## Preview
```bash
# Preview production build
npm run preview
```

## Installation in Chrome
After building:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## System Commands (Linux)
Standard Linux commands available:
- `ls`, `cd`, `pwd` - Directory navigation
- `grep`, `find` - File searching
- `cat`, `less` - File viewing
- `git` - Version control
- `zip`, `unzip` - Archive management