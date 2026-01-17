# Full-Stack Authentication Boilerplate

Modern authentication system built with NestJS and Next.js, featuring email verification, OAuth integration, and comprehensive security features.

![Authentication Demo](https://user-images.githubusercontent.com/25937925/77971844-11870400-72f0-11ea-8224-7e21a4f02a0a.png)

## Features

### Authentication

- ✅ Email/Password registration with verification
- ✅ Google OAuth integration
- ✅ Facebook OAuth integration
- ✅ Password reset via email
- ✅ JWT-based session management
- ✅ Role-based access control (User/Admin)

### Security

- ✅ bcrypt password hashing (work factor ≥10)
- ✅ Email verification required
- ✅ Rate limiting on auth endpoints
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation and sanitization

### Code Quality

- ✅ Automated pre-commit hooks (linting, formatting, testing)
- ✅ TypeScript strict mode (no `any` types)
- ✅ Conventional Commits enforcement
- ✅ ESLint + Prettier integration
- ✅ Comprehensive test suite

## Tech Stack

### Backend (NestJS)

- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport strategies
- **Email**: Nodemailer (supports Gmail, Outlook, AWS SES, Mailgun, SendGrid, custom SMTP)
- **Testing**: Jest + Supertest

### Frontend (Next.js)

- **Framework**: Next.js 16.1.2 with App Router
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Context API

## Setup Guides

Before you start, configure the required external services:

- **[SMTP Setup (Nodemailer)](./docs/setup-smtp.md)** - Email delivery for verification codes and password resets (supports Gmail, Outlook, custom SMTP, Mailgun, AWS SES, etc.)
- **[Google OAuth Setup](./docs/setup-google-oauth.md)** - Google social login integration
- **[Facebook OAuth Setup](./docs/setup-facebook-oauth.md)** - Facebook social login integration
- **[GitHub OAuth Setup](./docs/setup-github-oauth.md)** - GitHub social login integration

Each guide provides step-by-step instructions with screenshots, troubleshooting tips, and best practices.

## Getting Started

### Quick Start with Docker (Recommended)

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-username/FULL-MERN-AUTH-Boilerplate.git
cd FULL-MERN-AUTH-Boilerplate

# Start all services (MongoDB, Backend, Frontend)
docker compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

See [Docker Development Setup](#docker-development-setup) for more details.

### Prerequisites

For native development (without Docker):

- Node.js 18+ (20 LTS recommended)
- MongoDB 6+
- npm or yarn

**External Services** (see [Setup Guides](#setup-guides)):

- SMTP credentials (for email features) - [Setup Guide](./docs/setup-smtp.md)
- Google OAuth credentials (optional) - [Setup Guide](./docs/setup-google-oauth.md)
- Facebook OAuth credentials (optional) - [Setup Guide](./docs/setup-facebook-oauth.md)
- GitHub OAuth credentials (optional) - [Setup Guide](./docs/setup-github-oauth.md)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/FULL-MERN-AUTH-Boilerplate.git
   cd FULL-MERN-AUTH-Boilerplate
   ```

2. **Install dependencies**

   ```bash
   # Root dependencies (Husky, lint-staged, commitlint)
   npm install

   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**

   **Backend** (`backend/.env`):

   ```bash
   # Copy example config
   cp backend/.env.example backend/.env

   # Edit with your values
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/authboiler
   JWT_SECRET=your-super-secret-key

   # SMTP (Nodemailer) - See docs/setup-smtp.md
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=Auth Boilerplate

   # Google OAuth (Optional) - See docs/setup-google-oauth.md
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Facebook OAuth (Optional) - See docs/setup-facebook-oauth.md
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret

   # GitHub OAuth (Optional) - See docs/setup-github-oauth.md
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

   **Frontend** (`frontend/.env.local`):

   ```bash
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # OAuth Client IDs (Optional)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
   ```

   📖 **Detailed setup instructions**: See [Setup Guides](#setup-guides) for obtaining these credentials.

4. **Start MongoDB**

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or use local MongoDB installation
   mongod
   ```

5. **Run the applications**

   **Backend** (in `backend/` directory):

   ```bash
   # Development with hot reload
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

   **Frontend** (in `frontend/` directory):

   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

6. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api

## Development Workflow

### Code Quality Automation

This project uses automated pre-commit hooks to maintain code quality. When you commit:

- **Prettier** auto-formats your code
- **ESLint** checks and fixes code issues
- **TypeScript** verifies types (strict mode)
- **Tests** run for changed files
- **Commit messages** are validated (Conventional Commits)

📖 See [Code Quality Documentation](./docs/code-quality.md) for details.

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write code following TypeScript strict mode
   - Add tests for new features
   - Follow existing code patterns

3. **Commit your changes**

   ```bash
   # Hooks run automatically
   git add .
   git commit -m "feat(backend): add feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feat/your-feature-name
   # Create PR targeting master branch
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>(<scope>): <subject>

# Examples:
feat(backend): add two-factor authentication
fix(frontend): resolve login form validation
docs: update API documentation
chore(root): upgrade dependencies
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Scopes**: `backend`, `frontend`, `root`, `docs`

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend

# Tests (when configured)
npm test
```

## Project Structure

```
/
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/      # Authentication module
│   │   ├── user/      # User management
│   │   └── mail/      # Email service
│   └── test/          # E2E tests
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
├── docs/              # Project documentation
├── openspec/          # Spec-driven development
└── old-code/          # Legacy code (reference only)
```

## API Endpoints

### Interactive Documentation

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs) - Interactive API documentation (enable with `SWAGGER_ENABLED=true`)
- **OpenAPI Spec**: [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json) - Machine-readable API specification
- **Postman Collection**: See [`backend/docs/postman/`](./backend/docs/postman/) - Ready-to-use collection for API testing

### Authentication

| Method | Endpoint                    | Status | Description                              |
| ------ | --------------------------- | ------ | ---------------------------------------- |
| POST   | `/api/auth/register`        | ✅     | Register with email (sends 6-digit code) |
| POST   | `/api/auth/activate`        | ✅     | Activate account with code               |
| POST   | `/api/auth/login`           | ✅     | Login with email/password                |
| POST   | `/api/auth/logout`          | ✅     | Logout (invalidate session)              |
| POST   | `/api/auth/oauth/authorize` | ✅     | Get OAuth authorization URL              |
| POST   | `/api/auth/oauth/callback`  | ✅     | Handle OAuth callback                    |
| GET    | `/api/auth/oauth/providers` | ✅     | Get supported OAuth providers            |

### User (Protected)

| Method | Endpoint                           | Status | Description               |
| ------ | ---------------------------------- | ------ | ------------------------- |
| GET    | `/api/user/profile`                | ✅     | Get user profile          |
| PATCH  | `/api/user/profile`                | ✅     | Update profile            |
| POST   | `/api/user/password`               | ✅     | Change password           |
| GET    | `/api/user/sessions`               | ✅     | Get all sessions          |
| DELETE | `/api/user/sessions/:sessionId`    | ✅     | Revoke specific session   |
| POST   | `/api/user/sessions/revoke-others` | ✅     | Revoke all other sessions |
| DELETE | `/api/user/account`                | ✅     | Deactivate account        |

### Admin (Protected)

| Method | Endpoint                      | Status | Description                |
| ------ | ----------------------------- | ------ | -------------------------- |
| GET    | `/api/admin/users`            | ✅     | List all users (paginated) |
| GET    | `/api/admin/users/:id`        | ✅     | Get user by ID             |
| PATCH  | `/api/admin/users/:id/status` | ✅     | Update user status         |
| PATCH  | `/api/admin/users/:id/role`   | ✅     | Update user role           |
| DELETE | `/api/admin/users/:id`        | ✅     | Delete user                |

### Health

| Method | Endpoint      | Status | Description           |
| ------ | ------------- | ------ | --------------------- |
| GET    | `/api/health` | ✅     | Health check endpoint |

**Legend**: ✅ Implemented | 🚧 In Progress | ⏳ Planned

## Documentation

### Setup Guides

- [SMTP Setup (SendGrid)](./docs/setup-smtp.md) - Configure email delivery
- [Google OAuth Setup](./docs/setup-google-oauth.md) - Enable Google social login
- [Facebook OAuth Setup](./docs/setup-facebook-oauth.md) - Enable Facebook social login
- [GitHub OAuth Setup](./docs/setup-github-oauth.md) - Enable GitHub social login

### Backend API

- [Authentication Flow](./backend/docs/authentication-flow.md) - Registration, login, logout, sessions
- [User, Roles & Permissions](./backend/docs/user-roles-permissions.md) - User model, role hierarchy, RBAC

### Project Guides

- [Code Quality Standards](./docs/code-quality.md) - Pre-commit hooks, linting, formatting
- [Deployment Guide](./docs/deployment.md) - Docker and Vercel deployment instructions
- [Production Setup](./docs/PRODUCTION-SETUP.md) - Production deployment checklist
- [CLAUDE.md](./CLAUDE.md) - Complete project guidelines for AI assistants
- [OpenSpec Project](./openspec/project.md) - Project context and conventions

## Contributing

1. Read [CLAUDE.md](./CLAUDE.md) for coding standards
2. Read [Code Quality docs](./docs/code-quality.md) for tooling setup
3. Create a feature branch
4. Make changes with tests
5. Ensure all pre-commit checks pass
6. Submit PR targeting `master` branch

## Migration Status

This project is being refactored from Express/React to NestJS/Next.js:

- ✅ Project structure set up
- ✅ Code quality automation (Husky, ESLint, Prettier)
- ✅ Docker & Vercel deployment configuration
- ✅ Database models (User, Session, Permission)
- ✅ Email registration with 6-digit activation code
- ✅ Session-based authentication with HTTP-only cookies
- ✅ Role system (USER, SUPPORT, MANAGER, ADMIN)
- 🚧 Login endpoint (in progress)
- 🚧 Verification guards (in progress)
- ⏳ OAuth integration (Google, Facebook)
- ⏳ Password reset flow
- ⏳ Frontend implementation

Legacy code is preserved in `old-code/` for reference.

## Troubleshooting

### Pre-commit hooks not running

```bash
# Reinstall hooks
npm install

# Or manually
npx husky install
```

### MongoDB connection error

```bash
# Check MongoDB is running
docker ps | grep mongo

# Or check local MongoDB
pgrep mongod
```

### Type errors on commit

```bash
# Run type check
cd backend && tsc --noEmit
cd frontend && tsc --noEmit
```

See [Code Quality Troubleshooting](./docs/code-quality.md#troubleshooting) for more.

## Deployment

### Docker Development Setup

For local development with Docker Compose:

```bash
# Start all services with hot reload
docker compose up

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes (deletes database data)
docker compose down -v
```

See [Deployment Guide](./docs/deployment.md#docker-development-setup) for complete Docker setup instructions.

### Docker Production Setup

For production deployment with Docker Compose:

```bash
# Create production environment file
cp .env.docker.example .env.docker.prod

# Edit with production values
# Then start production stack
docker compose -f docker-compose.prod.yml up -d
```

See [Deployment Guide](./docs/deployment.md#docker-production-setup) for production deployment details.

### Vercel Deployment

Deploy the frontend to Vercel:

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

Configure environment variables in Vercel dashboard:

- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NEXT_PUBLIC_APP_URL` - Your frontend URL

See [Deployment Guide](./docs/deployment.md#vercel-deployment) for complete Vercel deployment instructions.

## Resources

### Tutorials

- [Original Tutorial](https://www.youtube.com/watch?v=y7yFXKsMD_U) (legacy stack reference)

### Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## License

[MIT License](LICENSE)

## Support

For issues or questions:

- Open an issue on GitHub
- Check existing documentation in `docs/`
- Review [CLAUDE.md](./CLAUDE.md) for guidelines
