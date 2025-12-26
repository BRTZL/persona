# Persona

An AI chat application featuring 8 unique AI personalities, each with distinct traits, expertise, and communication styles.

## Tech Stack

| Category             | Technology                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| **Framework**        | [Next.js 15](https://nextjs.org) with App Router                             |
| **Language**         | TypeScript (strict mode, no `any`)                                           |
| **Styling**          | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Database**         | [Supabase](https://supabase.com) (PostgreSQL + Auth)                         |
| **AI Provider**      | [OpenRouter](https://openrouter.ai) (multi-model support)                    |
| **State Management** | [TanStack Query](https://tanstack.com/query)                                 |
| **Validation**       | [Zod](https://zod.dev)                                                       |
| **AI SDK**           | [Vercel AI SDK](https://sdk.vercel.ai)                                       |

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- OpenRouter API key

### Environment Variables

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Database Setup

Run the Supabase migrations:

```bash
npx supabase db push
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `pnpm dev`      | Start development server          |
| `pnpm build`    | Build for production              |
| `pnpm check`    | Run lint, format, and type checks |
| `pnpm lint:fix` | Auto-fix linting issues           |
| `pnpm format`   | Format code with Prettier         |

## Architecture

### Project Structure

```text
├── app/                    # Next.js App Router pages
│   ├── api/chat/          # Streaming chat API endpoint
│   ├── auth/              # OAuth callback handling
│   └── chat/              # Chat UI pages
├── components/
│   ├── chat/              # Chat-specific components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── characters.ts      # AI personality definitions
│   ├── models.ts          # Available LLM models
│   ├── supabase/          # Supabase client utilities
│   └── title-generation.ts # AI-generated conversation titles
├── queries/               # TanStack Query hooks
└── supabase/              # Database migrations
```

### Key Architectural Decisions

#### Server-Side Message Persistence

Messages are saved server-side in the API route rather than client-side. This ensures data consistency and prevents duplicate saves when components re-render.

```text
User Message → API Route → Save to DB → Stream Response → Save Assistant Message
```

#### Multi-Model Support

The app supports multiple LLM providers through OpenRouter, allowing users to switch between models (Gemini, Claude, GPT-4o, Llama) per conversation.

#### AI-Generated Titles

Conversation titles are generated asynchronously after the first message exchange using a fast model (Gemini Flash), avoiding placeholder titles like "New Chat".

#### HTTP-Only Cookie Auth

Supabase auth tokens are stored in HTTP-only cookies (not localStorage) for XSS protection. The `/auth/callback` route handles the OAuth code exchange server-side.

#### Streaming with AI SDK

Uses Vercel AI SDK's `streamText` with smooth streaming transforms for a polished typing experience. The `TextStreamChatTransport` handles the client-server communication.

#### Theme-Aware Code Blocks

Syntax highlighting adapts to light/dark mode using Shiki with automatic theme detection via `next-themes`.

## Characters

The app includes 8 AI personalities:

| Character | Description                               |
| --------- | ----------------------------------------- |
| Luna      | Empathetic listener and emotional support |
| Atlas     | Strategic thinker and problem solver      |
| Nova      | Creative muse and artistic inspiration    |
| Sage      | Wise mentor and life advisor              |
| Echo      | Curious explorer and knowledge seeker     |
| Blaze     | Motivational coach and fitness expert     |
| Zen       | Mindfulness guide and meditation teacher  |
| Pixel     | Tech enthusiast and coding companion      |

Each character has a unique system prompt, avatar, and kickstart messages.

## License

MIT
