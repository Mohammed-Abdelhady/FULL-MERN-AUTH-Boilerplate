# Project Context

## Purpose

This is a full-stack MERN authentication boilerplate project that provides comprehensive user authentication functionality including:

-   User registration and login with email verification
-   Social authentication (Facebook, Google OAuth)
-   Password reset and forgot password functionality
-   Protected routes for authenticated users
-   Admin dashboard and role-based access control

The project is currently being refactored from an older Express/React stack to a modern NestJS/Next.js architecture while maintaining all existing authentication features.

## Tech Stack

### Backend (NestJS)

-   **Framework**: NestJS 11.0.1 (Node.js framework)
-   **Language**: TypeScript 5.7.3
-   **Platform**: Express.js
-   **Testing**: Jest for unit and e2e testing
-   **Code Quality**: ESLint 9.18.0, Prettier 3.4.2
-   **Build Tool**: NestJS CLI with ts-loader

### Frontend (Next.js)

-   **Framework**: Next.js 16.1.2 with App Router
-   **Language**: TypeScript 5.x
-   **UI Library**: React 19.2.3
-   **Styling**: Tailwind CSS 4.x
-   **Code Quality**: ESLint 9.x with Next.js config

### Legacy Stack (Reference - in old-code/)

-   **Backend**: Express.js with MongoDB (Mongoose)
-   **Frontend**: React 16.13.1 with React Router
-   **Authentication**: JWT, SendGrid for emails, Google/Facebook OAuth libraries

## Project Conventions

### Code Style

#### Backend (NestJS)

-   **Linting**: ESLint with TypeScript support and Prettier integration
-   **Formatting**: Prettier with single quotes and trailing commas
-   **TypeScript**: Strict type checking enabled
-   **File Structure**: Modular NestJS structure with modules, controllers, services
-   **Naming Conventions**:
    -   Classes: PascalCase (e.g., `AppController`, `AuthService`)
    -   Methods/Functions: camelCase (e.g., `createUser`, `validateToken`)
    -   Constants: UPPER_SNAKE_CASE (e.g., `API_KEY`, `MAX_RETRIES`)
    -   Files: kebab-case for modules (e.g., `auth.module.ts`)

#### Frontend (Next.js)

-   **Linting**: ESLint with Next.js recommended configuration
-   **Styling**: Tailwind CSS utility-first approach
-   **TypeScript**: Strict type checking enabled
-   **File Structure**: App Router structure with route-based organization
-   **Naming Conventions**:
    -   Components: PascalCase (e.g., `LoginForm`, `Dashboard`)
    -   Hooks: camelCase with 'use' prefix (e.g., `useAuth`, `useForm`)
    -   Utilities: camelCase (e.g., `formatDate`, `validateEmail`)

### Architecture Patterns

#### Backend Architecture

-   **Pattern**: Modular monolith with NestJS modules
-   **Layered Architecture**:
    -   Controllers: Handle HTTP requests/responses
    -   Services: Business logic and data processing
    -   Modules: Encapsulate related functionality
    -   DTOs: Data Transfer Objects for validation
-   **Dependency Injection**: NestJS built-in DI system
-   **Authentication**: JWT-based authentication (to be implemented)
-   **Database**: MongoDB with Mongoose ODM (from legacy code, to be migrated)

#### Frontend Architecture

-   **Pattern**: Component-based with Next.js App Router
-   **State Management**: React hooks and context (to be implemented)
-   **Routing**: File-based routing with Next.js App Router
-   **API Communication**: Axios or native fetch (to be implemented)
-   **Authentication Flow**: Token-based with localStorage/cookies (from legacy code)

### Testing Strategy

#### Backend Testing

-   **Unit Tests**: Jest with ts-jest for TypeScript
-   **E2E Tests**: Jest with Supertest for API testing
-   **Coverage**: Jest coverage reports required
-   **Test Location**: `*.spec.ts` files alongside source code
-   **Test Environment**: Node.js environment

#### Frontend Testing

-   **Testing Framework**: Jest and React Testing Library (to be configured)
-   **Component Tests**: Test component rendering and user interactions
-   **Integration Tests**: Test user flows and API integration
-   **Coverage**: Aim for >80% coverage on critical paths

### Git Workflow

#### Branching Strategy

-   **Main Branch**: `main` (production-ready code)
-   **Feature Branches**: `feature/feature-name` (new features)
-   **Bugfix Branches**: `bugfix/bug-name` (bug fixes)
-   **Refactor Branches**: `refactor/refactor-name` (code refactoring)
-   **Current Branch**: `refactor/modern-stack-nestjs-nextjs`

#### Commit Conventions

-   **Format**: Conventional Commits
    -   `feat: add new feature`
    -   `fix: fix bug`
    -   `refactor: refactor code`
    -   `docs: update documentation`
    -   `style: format code`
    -   `test: add tests`
    -   `chore: update dependencies`
-   **Commit Messages**: Clear, descriptive, and concise
-   **Commit Frequency**: Small, frequent commits with clear intent

#### Pull Request Process

-   PRs must pass all CI/CD checks
-   Code review required before merging
-   PR description should include:
    -   Purpose of changes
    -   Testing performed
    -   Breaking changes (if any)

## Domain Context

### Authentication Flow

1. **Registration**: User provides email/password → Server sends verification email → User verifies email
2. **Login**: User provides credentials → Server validates → Returns JWT token
3. **Social Auth**: User clicks Google/Facebook → OAuth flow → Server creates/updates user → Returns token
4. **Password Reset**: User requests reset → Server sends reset link → User creates new password
5. **Protected Routes**: Client includes token in requests → Server validates → Grants/denies access

### User Roles

-   **User**: Standard authenticated user
-   **Admin**: Elevated permissions for user management

### Security Considerations

-   JWT tokens for authentication
-   Password hashing (bcrypt) - from legacy code
-   Email verification required
-   Rate limiting on authentication endpoints (to be implemented)
-   CORS configuration (to be implemented)

## Important Constraints

### Technical Constraints

-   Must maintain backward compatibility with existing authentication features
-   Migration from Express/React to NestJS/Next.js should preserve all functionality
-   Database schema must remain compatible with existing MongoDB collections
-   API endpoints should follow RESTful conventions
-   Frontend must be responsive and mobile-friendly

### Business Constraints

-   Email delivery reliability (SendGrid integration)
-   OAuth provider requirements (Google, Facebook)
-   Password security standards (minimum length, complexity)
-   Session management and token expiration

### Regulatory Constraints

-   GDPR compliance for user data
-   Secure storage of user credentials
-   Privacy policy compliance

## External Dependencies

### Backend Services (To be Integrated)

-   **SendGrid**: Email service for verification and password reset emails
-   **MongoDB**: NoSQL database for user data
-   **Google OAuth**: Google authentication provider
-   **Facebook OAuth**: Facebook authentication provider

### Frontend Services (To be Integrated)

-   **Google OAuth Client**: React Google Login library
-   **Facebook OAuth Client**: React Facebook Login library
-   **Axios**: HTTP client for API communication

### Development Tools

-   **NestJS CLI**: Project scaffolding and code generation
-   **Next.js CLI**: Development server and build tools
-   **TypeScript Compiler**: Type checking and compilation
-   **ESLint & Prettier**: Code quality and formatting

### Package Managers

-   **npm**: Node.js package manager
-   **Node.js**: Runtime environment (version 18+ recommended)

## Migration Notes

### From Legacy to Modern Stack

-   **Backend**: Express.js → NestJS with TypeScript
-   **Frontend**: React 16 with CRA → Next.js 16 with App Router
-   **Styling**: Tailwind CSS → Tailwind CSS 4.x
-   **Build Tools**: Webpack → Next.js built-in bundler
-   **Testing**: Jest → Jest with improved configuration

### Features to Migrate

1. User registration with email verification
2. Email/password login
3. Google OAuth integration
4. Facebook OAuth integration
5. Forgot password functionality
6. Reset password functionality
7. Protected routes and authentication guards
8. Admin dashboard
9. User management (admin only)
10. Toast notifications for user feedback

### Database Schema (From Legacy)

-   Users collection with fields:
    -   email, password (hashed)
    -   name, role
    -   isVerified, verificationToken
    -   resetPasswordToken, resetPasswordExpires
    -   googleId, facebookId (for OAuth users)
    -   createdAt, updatedAt
