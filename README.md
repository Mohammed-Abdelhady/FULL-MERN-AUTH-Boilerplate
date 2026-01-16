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
- **Email**: SendGrid
- **Testing**: Jest + Supertest

### Frontend (Next.js)

- **Framework**: Next.js 16.1.2 with App Router
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ (20 LTS recommended)
- MongoDB 6+
- npm or yarn
- SendGrid API key (for email features)
- Google/Facebook OAuth credentials (for social auth)

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
   MAIL_KEY=your-sendgrid-api-key
   CLIENT_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   FACEBOOK_APP_ID=your-facebook-app-id
   ```

   **Frontend** (`frontend/.env.local`):

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
   ```

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

### Authentication

```
POST   /api/auth/register          # Register with email
POST   /api/auth/activate          # Verify email
POST   /api/auth/signin            # Login
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
POST   /api/auth/google            # Google OAuth
POST   /api/auth/facebook          # Facebook OAuth
```

### User (Protected)

```
GET    /api/user/profile           # Get user profile
PUT    /api/user/profile           # Update profile
GET    /api/user/list              # List users (admin only)
```

## Documentation

- [Code Quality Standards](./docs/code-quality.md) - Pre-commit hooks, linting, formatting
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
- ✅ Code quality automation
- 🚧 Authentication module (in progress)
- ⏳ User management (planned)
- ⏳ OAuth integration (planned)

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
