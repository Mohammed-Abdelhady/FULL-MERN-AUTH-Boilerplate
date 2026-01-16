# Frontend

Next.js 16 frontend application with React 19 and Tailwind CSS 4.

## Tech Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.1.2  | React framework with App Router |
| React        | 19.2.3  | UI library                      |
| TypeScript   | 5.x     | Type safety                     |
| Tailwind CSS | 4.x     | Styling                         |

## Quick Start

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── (auth)/             # Auth routes group (planned)
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (protected)/        # Protected routes group (planned)
│   │   ├── dashboard/
│   │   └── profile/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable components (planned)
│   ├── auth/               # Auth forms
│   ├── ui/                 # UI primitives
│   └── layout/             # Layout components
├── hooks/                  # Custom hooks (planned)
│   ├── useAuth.ts
│   └── useForm.ts
├── lib/                    # Utilities (planned)
│   ├── api/                # API client
│   └── validation/         # Zod schemas
├── context/                # React Context (planned)
│   └── AuthContext.tsx
├── types/                  # TypeScript types (planned)
└── constants/              # Constants (planned)
```

## Environment Variables

Create `.env.local` in the frontend directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# OAuth (Public Keys)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id

# App Configuration
NEXT_PUBLIC_APP_NAME=Auth Boilerplate
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development

### Path Aliases

The project uses `@/*` as a path alias for `src/*`:

```typescript
// Instead of relative imports
import { Button } from '../../../components/ui/Button';

// Use path alias
import { Button } from '@/components/ui/Button';
```

### Server vs Client Components

Next.js 16 uses Server Components by default:

```typescript
// Server Component (default) - no directive needed
export default function Page() {
  return <div>Server rendered</div>;
}

// Client Component - add directive at top
'use client';
export default function Form() {
  const [state, setState] = useState();
  return <form>...</form>;
}
```

Use Client Components only when needed:

- Using React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (window, localStorage, etc.)

### Code Style

- TypeScript strict mode (no `any` types)
- ESLint with Next.js config
- Tailwind CSS for styling
- Use `data-testid` for testable elements

## Features (Planned)

### Authentication Pages

- [ ] Login page with email/password
- [ ] Registration page with validation
- [ ] Email verification page (6-digit code)
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Google OAuth button
- [ ] Facebook OAuth button

### Protected Pages

- [ ] Dashboard
- [ ] User profile
- [ ] Settings

### Components

- [ ] Auth forms with Zod validation
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error boundaries

### State Management

- [ ] AuthContext for auth state
- [ ] API client with token injection
- [ ] Protected route middleware

## API Integration

The frontend communicates with the NestJS backend:

```typescript
// Example API call
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // For HTTP-only cookies
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
// { success: true, data: { user: {...} }, message: "..." }
```

### API Documentation

For comprehensive API documentation and testing:

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs) - Interactive API documentation
- **OpenAPI Spec**: [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json) - Machine-readable API specification
- **Postman Collection**: See [`../backend/docs/postman/`](../backend/docs/postman/) - Ready-to-use collection for API testing
- **Backend API Docs**: See [`../backend/docs/`](../backend/docs/) - Detailed API documentation

**Note:** Enable Swagger in development by setting `SWAGGER_ENABLED=true` in `backend/.env`.

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

Configure in Vercel dashboard:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend URL

### Docker

The frontend can be built with Docker. See root `docker-compose.yml`.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Backend API Documentation](../backend/docs/)
