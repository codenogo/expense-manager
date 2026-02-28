# CLAUDE.md — limohome

Agent instructions for this project. Claude reads this automatically.

## Project Overview

limohome — a full-stack web application built with Next.js and TypeScript.

## Quick Reference

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Run locally
npm run dev

# Lint
npm run lint

# Format
npm run format

# Type check
npx tsc --noEmit
```

## Code Organisation

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components
├── lib/              # Shared utilities and helpers
├── services/         # Business logic and API clients
├── types/            # TypeScript type definitions
└── config/           # Configuration

tests/
├── unit/             # Unit tests (*.test.ts)
├── integration/      # Integration tests (*.integration.ts)
└── fixtures/         # Test data and mocks
```

## Conventions

### Naming
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` (e.g., `UserProfile`)
- Functions: `camelCase` (e.g., `createUser`)
- Constants: `SCREAMING_SNAKE_CASE` or `camelCase`
- Types/Interfaces: `PascalCase`

### Code Style
- Max line length: 100 characters
- Use ESLint + Prettier
- Prefer `const` over `let`, never `var`
- Use async/await over raw promises
- Prefer named exports over default exports

### Git
- Branch naming: `feature/description`, `fix/description`
- Commit format: `feat(scope): description` or `fix(scope): description`
- PR: Squash and merge

## Architecture Rules

### Do
- Use TypeScript strict mode (`"strict": true`)
- Define explicit return types for public functions
- Use Zod for runtime validation at API boundaries
- Handle errors with try/catch and proper error types
- Use React Server Components where possible

### Don't
- Don't use `any` (use `unknown` and type guards)
- Don't mutate function parameters
- Don't ignore TypeScript errors with `// @ts-ignore`
- Don't mix client and server logic in the same file

## Testing

- Framework: Vitest or Jest
- Minimum coverage: 80%

## Security

- Never commit: `.env`, `.env.*`, secrets, API keys
- Always validate: Request bodies with Zod
- Always sanitize: User input before rendering

## Dependencies

Before adding dependencies:
1. Check bundle size impact (`bundlephobia.com`)
2. Verify last update and maintenance status
3. Check for known vulnerabilities (`npm audit`)
4. Prefer well-maintained packages with TypeScript support
