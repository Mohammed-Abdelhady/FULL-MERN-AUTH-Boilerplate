# Frontend

Next.js 16 application with React 19, TypeScript, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev          # Development (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run test:e2e     # Playwright E2E tests
```

## Tech Stack

- **Next.js 16** - App Router, Server Components
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **RTK Query** - API state management
- **shadcn/ui** - UI components
- **next-intl** - Internationalization (en/ar)

## Project Structure

```
src/
├── app/[locale]/           # App Router pages (i18n)
│   ├── (auth)/             # Auth pages (login, register, etc.)
│   ├── (dashboard)/        # Protected dashboard pages
│   └── layout.tsx          # Root layout
├── components/             # Shared components
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   └── navigation/         # Nav components
├── modules/                # Feature modules
│   ├── auth/               # Auth (forms, store, hooks)
│   ├── sessions/           # Session management
│   └── permissions/        # RBAC components
├── store/                  # Redux store
│   └── api/                # RTK Query APIs
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
├── i18n/                   # Translations (en.json, ar.json)
└── types/                  # TypeScript types
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

## Key Features

### Authentication Module (`src/modules/auth/`)

- Login/Register forms with validation
- OAuth buttons (Google, Facebook, GitHub)
- Password reset flow
- Profile management
- Linked accounts management

### Sessions Module (`src/modules/sessions/`)

- Active sessions list
- Device info parsing
- Session termination
- Bulk logout

### Permissions Module (`src/modules/permissions/`)

- Role management (CRUD)
- Permission assignment
- User role selector

## Development

### Path Aliases

Use `@/` for imports from `src/`:

```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/hooks';
```

### Server vs Client Components

```typescript
// Server Component (default)
export default function Page() {
  return <div>Server rendered</div>;
}

// Client Component (when needed)
'use client';
export default function Form() {
  const [state, setState] = useState();
  return <form>...</form>;
}
```

Use `'use client'` only when using hooks, event handlers, or browser APIs.

### Adding UI Components

```bash
npx shadcn@latest add button dialog
```

## Testing

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:headed   # See browser
npm run test:e2e:debug    # Debug mode
```

Test files: `e2e/*.spec.ts`

## Deployment

### Vercel

```bash
vercel login
vercel           # Preview
vercel --prod    # Production
```

Set environment variables in Vercel dashboard.

### Docker

Use `docker compose up` from root directory.

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Backend API](../backend/README.md)
