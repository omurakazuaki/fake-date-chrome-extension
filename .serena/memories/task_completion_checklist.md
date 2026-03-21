# Task Completion Checklist

When completing any coding task, follow these steps:

## 1. Code Quality Checks
```bash
# Always run linting
npm run lint
```

## 2. Type Checking
```bash
# Ensure TypeScript compiles without errors
npm run build
# or just type check:
npx tsc -b
```

## 3. Manual Testing
- For background script changes: Test in Chrome with dev tools console open
- For popup UI changes: Test popup by clicking extension icon
- For fake-date logic: Use test page with `npm run test:dev`

## 4. Build Verification
```bash
# Ensure production build succeeds
npm run build

# Check dist/ folder is generated correctly
ls -la dist/
```

## 5. Extension Testing
1. Load unpacked extension from `dist/` folder
2. Test on a real website (not test-page)
3. Verify badge updates correctly
4. Check Chrome DevTools console for errors
5. Test all time lapse modes (RESET, KEEP, STOP)
6. Test auto-reload functionality

## 6. Git Workflow
```bash
# Stage changes
git add <files>

# Commit with meaningful message (in English or Japanese)
git commit -m "descriptive message"

# Push if needed
git push
```

## Important Notes
- **No formatter script**: Run Prettier manually if needed (`npx prettier --write .`)
- **Strict types**: All code must pass TypeScript strict mode
- **No semicolons**: Follow project's no-semicolon convention
- **Chrome Manifest V3**: Ensure compatibility with MV3 APIs
- **Testing**: Always test both popup UI and injected script functionality