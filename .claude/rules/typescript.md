# TypeScript Rules

## CRITICAL: Strict Type Safety

**No `any` or `unknown` types.** All code must be fully typed.

### Forbidden Patterns

```tsx
// ❌ NEVER use any
function process(data: any) { ... }
const result: any = await fetch(...)

// ❌ NEVER use unknown without narrowing
function handle(data: unknown) {
  return data.value  // Error: can't access without narrowing
}

// ❌ NEVER use type assertions to bypass safety
const user = data as User  // Avoid unless absolutely necessary
```

### Required Patterns

```tsx
// ✅ Explicit types
function process(data: Character): ProcessedCharacter { ... }

// ✅ Type narrowing for unknown
function handle(data: unknown): string {
  if (typeof data === "string") {
    return data
  }
  throw new Error("Expected string")
}

// ✅ Zod for external data validation
const CharacterSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
})

const character = CharacterSchema.parse(externalData)
```

## Type vs Interface

**Always use `type` over `interface`.**

```tsx
// ❌ Don't use interface
interface CharacterProps {
  character: Character
}

// ✅ Use type
type CharacterProps = {
  character: Character
}
```

### Exception: Extending Types

Use `interface` only when you need declaration merging (rare):

```tsx
// ✅ Only for module augmentation
declare module "some-library" {
  interface SomeType {
    newProperty: string;
  }
}
```

## Discriminated Unions

Use discriminated unions with switch statements for type-safe branching:

```tsx
// ✅ Discriminated union
type Message =
  | { type: "user"; content: string }
  | { type: "assistant"; content: string; model: string }
  | { type: "system"; content: string };

function renderMessage(message: Message) {
  switch (message.type) {
    case "user":
      return <UserMessage content={message.content} />;
    case "assistant":
      return (
        <AssistantMessage content={message.content} model={message.model} />
      );
    case "system":
      return <SystemMessage content={message.content} />;
  }
}
```

## Zod for Validation

Use Zod for all external data validation.

### API Responses

```tsx
// ✅ Validate API responses
const OpenRouterResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string(),
      role: z.enum(["assistant"]),
    }),
  })),
})

const response = await fetch(...)
const json = await response.json()
const parsed = OpenRouterResponseSchema.parse(json)
```

### Form Data

```tsx
// ✅ Validate form inputs
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const result = LoginSchema.safeParse(formData)
if (!result.success) {
  return { errors: result.error.flatten().fieldErrors }
}
```

### CRITICAL: UUID Validation

**Use `z.uuid()`, NEVER `z.string().uuid()`.**

```tsx
// ❌ WRONG
const schema = z.object({
  id: z.string().uuid(),
})

// ✅ CORRECT
const schema = z.object({
  id: z.uuid(),
})
```

## Function Types

### Return Types

Always specify return types for non-trivial functions:

```tsx
// ✅ Explicit return type
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Async return type
async function fetchCharacter(slug: string): Promise<Character> {
  const { data } = await supabase
    .from("characters")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}
```

### Callback Types

```tsx
// ✅ Typed callbacks
type OnSendCallback = (content: string) => void;
type OnErrorCallback = (error: Error) => void;

function ChatInput({ onSend }: { onSend: OnSendCallback }) {
  // ...
}
```

## Generic Types

Use generics for reusable utilities:

```tsx
// ✅ Generic response wrapper
type ApiResponse<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

// ✅ Usage
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
```

## Import Types

Use `type` imports for type-only imports:

```tsx
// ✅ Type-only imports
// ✅ Mixed imports
import { type QueryKey, queryOptions } from "@tanstack/react-query";
import type { Tables } from "@/generated/database.types";
import type { Character } from "@/queries";
```

## Naming Conventions

| Type            | Convention           | Example              |
| --------------- | -------------------- | -------------------- |
| Types           | PascalCase           | `CharacterProps`     |
| Type parameters | Single uppercase     | `T`, `K`, `V`        |
| Enums           | PascalCase           | `MessageRole`        |
| Constants       | SCREAMING_SNAKE_CASE | `MAX_MESSAGE_LENGTH` |

## Type Checking

Run type checking before commits:

```bash
pnpm check-types
```

This runs `tsc --noEmit` across all packages.
