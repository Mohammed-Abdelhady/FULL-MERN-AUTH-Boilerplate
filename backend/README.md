# Backend API

NestJS 11 backend API with authentication, session management, and role-based access control.

## Tech Stack

| Technology | Version | Purpose           |
| ---------- | ------- | ----------------- |
| NestJS     | 11.0.1  | Node.js framework |
| TypeScript | 5.7.3   | Type safety       |
| MongoDB    | 6+      | Database          |
| Mongoose   | 8.x     | ODM               |
| bcrypt     | 5.x     | Password hashing  |
| Nodemailer | 6.x     | Email service     |

## Quick Start

```bash
# Install dependencies
npm install

# Development with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Testing
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage

# Code quality
npm run lint          # ESLint
npm run format        # Prettier
```

## Documentation

| Document                                                    | Description                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| [Authentication Flow](docs/authentication-flow.md)          | Registration, activation, login, logout, session management   |
| [User, Roles & Permissions](docs/user-roles-permissions.md) | User model, role hierarchy (USER/SUPPORT/MANAGER/ADMIN), RBAC |
| [API Responses](docs/api-responses.md)                      | Standardized API response format and error codes              |

## API Documentation (Swagger)

### Interactive API Documentation

The backend includes Swagger/OpenAPI documentation for interactive API exploration:

**Enable Swagger in Development:**

Set `SWAGGER_ENABLED=true` in your `.env` file:

```bash
# backend/.env
SWAGGER_ENABLED=true
```

**Access Documentation:**

- **Swagger UI**: http://localhost:3000/api/docs - Interactive API documentation with "Try it out" feature
- **OpenAPI Spec**: http://localhost:3000/api/docs-json - Machine-readable API specification

**Features:**

- Auto-generated from TypeScript decorators and DTOs
- Interactive "Try it out" for testing endpoints directly
- JWT Bearer authentication support
- Request/response schema documentation
- Download OpenAPI specification for other tools

**Security Note:**

Swagger is disabled by default in production. Only enable in development environments.

## Postman Collection

A ready-to-use Postman collection is available for API testing:

**Location:** [`backend/docs/postman/`](./docs/postman/)

**Quick Start:**

1. Import `FULL-MERN-AUTH-Boilerplate-API.postman_collection.json` into Postman
2. Import environment file (`dev.json`, `staging.json`, or `production.json`)
3. Set active environment
4. Run requests to test the API

**Features:**

- All 19 API endpoints pre-configured
- Automatic JWT token handling
- Environment variables for different environments
- Test scripts for response validation
- Pre-request scripts for authentication

**See:** [`backend/docs/postman/README.md`](./docs/postman/README.md) for detailed usage instructions.

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── auth.module.ts      # Module definition
│   ├── dto/                # Request/Response DTOs
│   ├── guards/             # Auth & Verified guards
│   ├── decorators/         # @Public, @CurrentUser
│   ├── schemas/            # PendingRegistration schema
│   └── services/           # SessionService
├── user/                   # User module
│   ├── schemas/            # User schema
│   └── enums/              # UserRole enum
├── session/                # Session module
│   └── schemas/            # Session schema
├── permission/             # Permission module
│   └── schemas/            # Permission schema
├── mail/                   # Mail module
│   └── mail.service.ts     # Nodemailer service
├── common/                 # Shared utilities
│   ├── dto/                # Common DTOs
│   └── services/           # HashService
├── config/                 # Configuration
│   └── configuration.ts    # Environment config
└── app.module.ts           # Root module

docs/
├── postman/               # Postman collection and environments
│   ├── FULL-MERN-AUTH-Boilerplate-API.postman_collection.json
│   ├── dev.json
│   ├── staging.json
│   ├── production.json
│   └── README.md
├── authentication-flow.md
├── user-roles-permissions.md
└── api-responses.md
```

## Environment Variables

Create `.env` in the backend directory:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/authboiler

# Frontend URL (CORS)
CLIENT_URL=http://localhost:3000

# Session
SESSION_COOKIE_NAME=sid
SESSION_COOKIE_MAX_AGE=604800000    # 7 days in ms
SESSION_EXPIRES_IN=604800000        # 7 days in ms

# Activation Code
ACTIVATION_CODE_EXPIRES_IN=900000   # 15 min in ms
ACTIVATION_MAX_ATTEMPTS=5

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Security
BCRYPT_ROUNDS=10

# Swagger/OpenAPI Documentation (development only)
SWAGGER_ENABLED=false    # Set to true to enable Swagger UI at /api/docs
```

## API Endpoints

### Authentication

| Method | Endpoint             | Auth     | Description                              |
| ------ | -------------------- | -------- | ---------------------------------------- |
| POST   | `/api/auth/register` | Public   | Register (sends 6-digit activation code) |
| POST   | `/api/auth/activate` | Public   | Activate account with code               |
| POST   | `/api/auth/login`    | Public   | Login with email/password                |
| POST   | `/api/auth/logout`   | Required | Logout (invalidate session)              |

### User (Protected)

| Method | Endpoint            | Auth     | Description              |
| ------ | ------------------- | -------- | ------------------------ |
| GET    | `/api/user/profile` | Required | Get current user profile |
| PUT    | `/api/user/profile` | Required | Update profile           |

## Authentication Flow

### Registration Flow

```
1. POST /api/auth/register { email, password, name }
2. Server validates, hashes password, generates 6-digit code
3. Code sent via email (15 min expiry)
4. POST /api/auth/activate { email, code }
5. User created, session started, HTTP-only cookie set
```

### Login Flow

```
1. POST /api/auth/login { email, password }
2. Server validates credentials
3. Session created, HTTP-only cookie set
4. Response includes user data and isVerified status
```

### Session Management

- HTTP-only cookies prevent XSS attacks
- SameSite=Strict prevents CSRF
- Sessions stored in MongoDB with TTL auto-cleanup
- Device tracking via User-Agent

## Database Models

### User

```typescript
{
  email: string;           // Unique, lowercase
  password: string;        // bcrypt hashed, hidden
  name: string;
  role: 'user' | 'support' | 'manager' | 'admin';
  isVerified: boolean;
  googleId?: string;
  facebookId?: string;
  isDeleted: boolean;
  deletedAt?: Date;
}
```

### Session

```typescript
{
  user: ObjectId; // Reference to User
  token: string; // Unique session token
  userAgent: string;
  ip: string;
  isValid: boolean;
  expiresAt: Date; // TTL index for auto-cleanup
}
```

### Permission

```typescript
{
  user: ObjectId;
  permission: string;      // Format: resource:action
  granted: boolean;
  scope: 'own' | 'all' | 'team';
  expiresAt?: Date;        // Optional TTL
}
```

## Role Hierarchy

```
ADMIN (4)     - Full system access (*)
    ↓
MANAGER (3)   - Team management, reports
    ↓
SUPPORT (2)   - Customer service, tickets
    ↓
USER (1)      - Basic authenticated user (default)
```

## Guards

### AuthGuard

Validates session from HTTP-only cookie:

- Returns 401 if no session cookie
- Returns 401 if session invalid/expired
- Attaches user to request

### VerifiedGuard

Checks email verification status:

- Returns 403 if `isVerified: false`
- Use after AuthGuard

### Usage

```typescript
// Public route (no auth)
@Public()
@Post('register')
async register() {}

// Requires valid session
@UseGuards(AuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user) {}

// Requires valid session + verified email
@UseGuards(AuthGuard, VerifiedGuard)
@Post('orders')
async createOrder() {}
```

## Testing

### Unit Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage report
```

### E2E Tests

```bash
npm run test:e2e            # Run E2E tests
```

### Test Structure

```
src/
├── auth/
│   ├── auth.service.spec.ts      # Unit tests
│   └── auth.controller.spec.ts   # Controller tests
test/
└── auth.e2e-spec.ts              # E2E tests
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t backend .

# Run container
docker run -p 5000:5000 --env-file .env backend
```

Or use docker-compose from root directory:

```bash
docker compose up backend
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Documentation](https://mongoosejs.com/docs)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

## License

[MIT License](https://github.com/nestjs/nest/blob/master/LICENSE)
