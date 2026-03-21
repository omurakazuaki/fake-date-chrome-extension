# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled with very strict ESLint rules
- **No Implicit Any**: All types must be explicit
- **Type Annotations**: Required for all declarations (via `@typescript-eslint/typedef`)
- **References**: Uses project references (tsconfig.app.json, tsconfig.node.json)

## ESLint Rules
Key enforced rules:
- `@typescript-eslint/no-explicit-any`: Error
- `@typescript-eslint/no-implicit-any`: Error
- `@typescript-eslint/typedef`: Error (all variables must have type annotations)
- `no-var`: Error (use const/let only)
- `one-var`: ['error', 'never'] (one declaration per variable)
- `no-unreachable`: Error
- React Hooks rules enforced
- React Refresh only-export-components warning

## Prettier Configuration
- **Semicolons**: No semicolons (`semi: false`)
- **Quotes**: Single quotes (`singleQuote: true`)
- **Trailing Commas**: Always (`trailingComma: 'all'`)
- **Markdown**: Uses `markdown-nocjsp` parser for `.md` files

## Naming Conventions
Based on codebase analysis:
- **Functions**: camelCase (e.g., `calculateStartingTime`, `setupFakeDate`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_HISTORY_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `Setting`, `HistoryItem`, `FakeDate`)
- **React Components**: PascalCase (e.g., `Form`)
- **Hooks**: camelCase with `use` prefix (e.g., `useStorage`, `useForm`)
- **Private Functions**: prefixed with `execute` for background script actions

## Code Organization
- **One export per file**: Most files export a single main function/component
- **Separation of Concerns**: 
  - Logic in hooks
  - UI in components
  - Business logic in lib/
  - Chrome API interactions in background/
- **Type Safety**: All Chrome API calls properly typed with `@types/chrome`

## React Patterns
- **Functional Components**: All components use function syntax
- **Hooks**: Custom hooks for state and side effects
- **Material-UI**: Uses MUI components consistently
- **Emotion**: CSS-in-JS via @emotion/react and @emotion/styled

## Comments
- Japanese language used in user-facing strings and comments
- JSDoc-style comments for complex functions
- Inline comments for business logic explanations