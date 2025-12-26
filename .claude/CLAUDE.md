# Agent Configuration for Persona AI

## Code Style Guidelines

- Strict TypeScript - no `any` or `unknown` types
- Use Zod schemas for all validation (API, queues, external responses)
- Prefer `type` over `interface` for type aliases
- Use discriminated unions with switch statements for type safety
- Always use `.returning()` when inserting database records
- Use `z.uuid()` for UUID validation, never `z.string().uuid()`

## Naming Conventions

- Files: kebab-case (`course-fanout.ts`)
- Components: PascalCase (`CourseCard.tsx`)
- Functions: camelCase (`handleCourseFanout`)
- Types/Interfaces: PascalCase (`TranslationQueueData`)
- Database fields: snake_case (`created_at`, `user_id`)
- Style variables: camelCase with `$` prefix, no "Style" suffix (`$container`, `$header`, `$field`)

## React Query Patterns

- Use `isPending` to check mutation loading state (not `isLoading`)
- Use `infiniteQueryOptions` for paginated data with "Load More" functionality
- Use `mutationOptions` for mutations with proper success/error handling
- Always invalidate relevant queries after successful mutations
- Use `queryClient.invalidateQueries` to refresh data after mutations

## Important Notes

- Never run development servers yourself - always let the user start them
- Implement proper pagination in API endpoints
- use context7 for getting up to date information
