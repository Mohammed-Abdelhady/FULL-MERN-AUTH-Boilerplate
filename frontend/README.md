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

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user with email verification.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

#### POST /api/auth/verify-email

Verify email with code sent during registration.

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "permissions": ["profile:read:own", "profile:update:own"]
  }
}
```

#### POST /api/auth/google

Authenticate with Google OAuth token.

**Request Body:**

```json
{
  "token": "google_id_token"
}
```

#### POST /api/auth/github

Authenticate with GitHub OAuth code.

**Request Body:**

```json
{
  "code": "github_authorization_code"
}
```

#### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password

Reset password with token from email.

**Request Body:**

```json
{
  "token": "reset_token",
  "password": "NewSecurePass123!"
}
```

---

### Session Management Endpoints

#### GET /api/user/sessions

Get all active sessions for the current user.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
[
  {
    "id": "session_id",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    "ip": "192.168.1.100",
    "deviceName": "Chrome on macOS",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "lastUsedAt": "2024-01-20T15:30:00.000Z",
    "isCurrent": true
  }
]
```

#### DELETE /api/user/sessions/:id

Terminate a specific session.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "message": "Session terminated successfully"
}
```

#### POST /api/user/sessions/revoke-all

Terminate all sessions except the current one.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "message": "All other sessions terminated successfully",
  "count": 3
}
```

---

### Role Management Endpoints

#### GET /api/roles

List all roles (requires `roles:read:all` permission).

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "roles": [
    {
      "id": "role_id",
      "name": "Manager",
      "slug": "manager",
      "description": "Can manage users and content",
      "permissions": ["users:read:all", "users:update:all"],
      "isSystemRole": false,
      "isProtected": false
    }
  ]
}
```

#### POST /api/roles

Create a new role (requires `roles:create` permission).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "name": "Content Manager",
  "description": "Manages content and posts",
  "permissions": ["posts:read:all", "posts:create", "posts:update:all"]
}
```

#### PATCH /api/roles/:id

Update an existing role (requires `roles:update` permission).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "description": "Updated description",
  "permissions": ["posts:read:all", "posts:create", "posts:update:all", "posts:delete:own"]
}
```

#### DELETE /api/roles/:id

Delete a role (requires `roles:delete` permission). Cannot delete protected roles.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "message": "Role deleted successfully"
}
```

---

### Permission Management Endpoints

#### GET /api/permissions/user/:userId

Get all permissions for a specific user (inherited from role + direct).

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "userId": "user_id",
  "role": "manager",
  "permissions": ["users:read:all", "users:update:all", "posts:create"]
}
```

#### POST /api/permissions/user/:userId

Add a direct permission to a user (requires `permissions:manage:all`).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "permission": "users:delete:all"
}
```

#### DELETE /api/permissions/user/:userId

Remove a direct permission from a user (requires `permissions:manage:all`).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "permission": "users:delete:all"
}
```

---

### User Management Endpoints

#### GET /api/users

List all users (requires `users:read:all` permission).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or email

**Response:**

```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "isVerified": true,
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

#### PATCH /api/users/:id/role

Update a user's role (requires `users:update:all` permission).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "role": "manager"
}
```

---

## Testing

### Running E2E Tests

The project includes comprehensive Playwright E2E tests for critical user flows.

```bash
cd frontend

# Run all tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

**Test Coverage:**

- ✅ Role management (create, edit, delete flows)
- ✅ Session management (logout, bulk logout)
- ✅ Permission assignment
- ✅ Mobile sidebar navigation
- ✅ Responsive breakpoints
- ✅ Keyboard interactions

**Test Files:**

- `e2e/role-management.spec.ts` - Role CRUD operations
- `e2e/session-management.spec.ts` - Session tracking and termination
- `e2e/sidebar-navigation.spec.ts` - Navigation and responsiveness

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
