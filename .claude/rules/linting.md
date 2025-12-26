# Linting and Formatting Rules

## Available Commands

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `pnpm lint`         | Run ESLint with zero warnings allowed  |
| `pnpm lint:fix`     | Run ESLint and auto-fix issues         |
| `pnpm format`       | Format all files with Prettier         |
| `pnpm format:check` | Check if files are formatted (CI)      |
| `pnpm check-types`  | Run TypeScript type checking           |
| `pnpm check`        | Run all checks (lint + format + types) |

## Before Committing

Always run the full check before committing:

```bash
pnpm check
```

This runs lint, format check, and type checking in sequence.

## ESLint Rules

### Strict TypeScript

- `@typescript-eslint/no-explicit-any: "error"` — No `any` types allowed
- `@typescript-eslint/consistent-type-definitions: ["error", "type"]` — Use `type` over `interface`
- `@typescript-eslint/consistent-type-imports` — Use `import type` for type-only imports
- `@typescript-eslint/no-unused-vars` — No unused variables (prefix with `_` to ignore)

### Import Rules

- `import/no-duplicates: "error"` — No duplicate imports
- Import ordering is handled by Prettier plugin

## Prettier Configuration

Located in `.prettierrc.json`:

- **Double quotes** for strings
- **Semicolons** at end of statements
- **Trailing commas** in ES5 contexts
- **2 spaces** for indentation
- **80 character** line width

### Plugins

1. **`@trivago/prettier-plugin-sort-imports`** — Auto-sorts imports:
   - React imports first
   - Next.js imports
   - Third-party modules
   - Internal `@/` imports
   - Relative imports

2. **`prettier-plugin-tailwindcss`** — Auto-sorts Tailwind CSS classes

## VS Code Integration

### Format on Save

Enabled by default. Files are formatted with Prettier when saved.

### ESLint Auto-fix

ESLint fixes are applied on save via `editor.codeActionsOnSave`.

### Required Extensions

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Ignoring Files

### ESLint

Ignores are configured in `eslint.config.mjs`:

- `.next/**`, `out/**`, `build/**`, `dist/**`
- `node_modules/**`
- Config files (`*.config.js`, `*.config.mjs`)

### Prettier

Ignores are configured in `.prettierignore`:

- Build outputs (`.next`, `out`, `build`, `dist`)
- Dependencies (`node_modules`)
- Lock files (`pnpm-lock.yaml`)
