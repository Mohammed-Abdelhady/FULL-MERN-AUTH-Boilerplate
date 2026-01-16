# Tasks: Setup Backend Infrastructure

## Overview
Implementation tasks for setting up backend core infrastructure including health monitoring, MongoDB, security middleware, and environment configuration.

## Task List

### Phase 1: Dependencies Installation ✅ COMPLETED

#### 1. Install core dependencies ✅
- [x] Install `@nestjs/config` in backend
- [x] Install `@nestjs/mongoose` in backend
- [x] Install `mongoose` in backend
- [x] Install `@nestjs/throttler` in backend
- [x] Install `helmet` in backend
- [x] Install `class-validator` in backend
- [x] Install `class-transformer` in backend

**Validation**: ✅ All packages installed successfully

#### 2. Install type definitions ✅
- [x] Install `@types/mongoose` as devDependency

**Validation**: ✅ TypeScript recognizes Mongoose types

### Phase 2: Environment Configuration ✅ COMPLETED

#### 3. Create environment configuration module ✅
- [x] Create `src/config/configuration.ts` for typed config
- [x] Define configuration interface with all env vars
- [x] Export typed configuration factory function
- [x] Add validation schema using class-validator

**Validation**: ✅ Configuration file exports valid TypeScript types

#### 4. Setup ConfigModule in AppModule ✅
- [x] Import `ConfigModule.forRoot()` in AppModule
- [x] Configure to load from `.env` file
- [x] Set `isGlobal: true` for app-wide access
- [x] Add `validate` function for env var validation
- [x] Set `envFilePath: '.env'`

**Validation**: ✅ Application starts and loads environment variables

#### 5. Create .env.example template ✅
- [x] Create `backend/.env.example` file with all required variables:
  - [x] `NODE_ENV` with example value and description
  - [x] `PORT` with default 3000
  - [x] `MONGO_URI` with localhost example
  - [x] `CLIENT_URL` with frontend URL
  - [x] `THROTTLE_TTL` with default 60
  - [x] `THROTTLE_LIMIT` with default 60
  - [x] Add comments explaining each variable
  - [x] Add instructions at top of file

**Validation**: ✅ `.env.example` is complete and well-documented

#### 6. Create actual .env file ✅
- [x] Copy `.env.example` to `.env`
- [x] Fill in actual values for local development
- [x] Verify `.env` is in `.gitignore` (should already be)

**Validation**: ✅ `.env` file exists and has valid values

### Phase 3: MongoDB Integration ⏸ NOT STARTED

#### 7. Configure MongooseModule ⏸
- [ ] Import `MongooseModule.forRootAsync()` in AppModule
- [ ] Inject ConfigService
- [ ] Configure connection URI from env
- [ ] Add connection options:
  - Connection pooling settings
  - Timeout configurations
  - Auto-index for development
- [ ] Add connection event handlers (connected, error, disconnected)

**Validation**: Application connects to MongoDB on startup

#### 8. Test database connection ⏸
- [ ] Start MongoDB locally (or use MongoDB Atlas)
- [ ] Run `npm run start:dev`
- [ ] Verify connection success log message
- [ ] Test connection failure scenario (wrong URI)
- [ ] Verify graceful error handling

**Validation**: App connects when MongoDB is available, fails gracefully when not

### Phase 4: Health Check Module ⏸ NOT STARTED

#### 9. Create Health module structure ⏸
- [ ] Create `src/health/` directory
- [ ] Create `health.module.ts`
- [ ] Create `health.controller.ts`
- [ ] Create `health.service.ts`
- [ ] Register HealthModule in AppModule imports

**Validation**: Module structure exists and imports correctly

#### 10. Implement health service ⏸
- [ ] Implement `checkDatabaseHealth()` method:
  - Use Mongoose connection state
  - Measure database response time with ping
  - Return status and responseTime
- [ ] Implement `getMemoryUsage()` method:
  - Use `process.memoryUsage()`
  - Calculate used/total/percentage
  - Return formatted memory stats
- [ ] Implement `getUptime()` method:
  - Use `process.uptime()`
  - Return uptime in seconds
- [ ] Implement `getHealth()` method:
  - Aggregate all health checks
  - Return comprehensive health object

**Validation**: Service methods return expected data structures

#### 11. Implement health controller ⏸
- [ ] Create `GET /health` endpoint
- [ ] Call HealthService.getHealth()
- [ ] Return JSON response with status 200
- [ ] Handle errors (return 503 if DB unavailable)
- [ ] Add appropriate HTTP status codes

**Validation**: `curl http://localhost:3000/health` returns health status

#### 12. Add health endpoint tests ⏸
- [ ] Create `health.controller.spec.ts` unit test
- [ ] Mock HealthService
- [ ] Test successful health check
- [ ] Test database unavailable scenario
- [ ] Create `health.e2e-spec.ts` integration test
- [ ] Test actual endpoint response

**Validation**: `npm test` passes all health tests

### Phase 5: Security Middleware ⏸ NOT STARTED

#### 13. Configure CORS ⏸
- [ ] Update `main.ts` to enable CORS
- [ ] Use ConfigService to get `CLIENT_URL`
- [ ] Configure CORS options:
  - `origin`: CLIENT_URL from env
  - `credentials`: true (for cookies)
  - `methods`: GET, POST, PUT, PATCH, DELETE
  - `allowedHeaders`: Content-Type, Authorization
- [ ] Test CORS with frontend origin
- [ ] Test CORS rejects unknown origins

**Validation**: Frontend can make requests, other origins are blocked

#### 14. Setup rate limiting (Throttler) ⏸
- [ ] Import `ThrottlerModule.forRootAsync()` in AppModule
- [ ] Inject ConfigService
- [ ] Configure from environment:
  - `ttl`: from THROTTLE_TTL (60 seconds)
  - `limit`: from THROTTLE_LIMIT (60 requests)
- [ ] Add `ThrottlerGuard` to AppModule providers as APP_GUARD
- [ ] Test rate limiting by making 61 requests in 60 seconds

**Validation**: 61st request returns 429 Too Many Requests

#### 15. Add Helmet security headers ⏸
- [ ] Import `helmet` in `main.ts`
- [ ] Call `app.use(helmet())` before other middleware
- [ ] Configure Helmet options for development:
  - CSP permissive for dev
  - HSTS only in production
- [ ] Verify security headers in response

**Validation**: `curl -I http://localhost:3000/health` shows Helmet headers

#### 16. Configure global validation pipe ⏸
- [ ] Add `app.useGlobalPipes()` in `main.ts`
- [ ] Configure ValidationPipe with options:
  - `whitelist`: true (strip unknown properties)
  - `forbidNonWhitelisted`: true (throw if unknown)
  - `transform`: true (transform to DTO instances)
- [ ] Test with a DTO that validates

**Validation**: Invalid DTOs are rejected with clear error messages

### Phase 6: Code Organization & Best Practices ⏸ NOT STARTED

#### 17. Update main.ts with all middleware ⏸
- [ ] Organize middleware in logical order:
  1. Helmet (security headers first)
  2. CORS (before routing)
  3. Global validation pipe
  4. Rate limiting (via guard)
- [ ] Add startup logging (port, environment, DB status)
- [ ] Add graceful shutdown hooks
- [ ] Extract configuration to helper function if complex

**Validation**: `main.ts` is clean and well-organized

#### 18. Add environment validation ⏸
- [ ] Create validation DTO for environment variables
- [ ] Use class-validator decorators:
  - `@IsString()`, `@IsNumber()`, `@IsEnum()`
  - `@IsNotEmpty()` for required vars
  - `@IsOptional()` for optional vars
- [ ] Add validation to ConfigModule
- [ ] Test startup with missing required variable (should fail)
- [ ] Test startup with invalid variable type (should fail)

**Validation**: App fails fast with clear error if env vars invalid

### Phase 7: Documentation Updates ⏸ PARTIALLY COMPLETED

#### 19. Update README.md ⏸
- [ ] Add MongoDB installation section:
  - Local installation instructions (macOS, Windows, Linux)
  - Docker alternative: `docker run -d -p 27017:27017 mongo:latest`
  - MongoDB Atlas cloud option
- [ ] Update "Prerequisites" section with MongoDB requirement
- [ ] Add "Environment Configuration" section:
  - Explain `.env.example` and `.env`
  - List all required environment variables
  - Provide example values
- [ ] Add "Health Endpoint" section:
  - Document `GET /health` response format
  - Explain each field
  - Show example response
- [ ] Update "Getting Started" with backend-specific steps:
  - Copy .env.example to .env
  - Configure environment variables
  - Start MongoDB
  - Run backend
- [ ] Add "API Endpoints" section with health endpoint
- [ ] Update "Troubleshooting" with common issues:
  - MongoDB connection errors
  - Environment variable errors
  - Rate limiting errors

**Validation**: README has comprehensive backend setup instructions

#### 20. Update project documentation ⏸
- [ ] Add comment to `src/config/configuration.ts` explaining usage
- [ ] Add JSDoc comments to HealthService methods
- [ ] Add inline comments for complex middleware configuration
- [ ] Update `openspec/project.md` if needed

**Validation**: Code is well-documented

### Phase 8: Testing & Validation ⏸ NOT STARTED

#### 21. Create comprehensive E2E test ⏸
- [ ] Create `test/app.e2e-spec.ts` for full app test
- [ ] Test application startup
- [ ] Test health endpoint
- [ ] Test CORS configuration
- [ ] Test rate limiting (using test database)
- [ ] Test with missing environment variables
- [ ] Test with invalid MongoDB URI

**Validation**: `npm run test:e2e` passes all tests

#### 22. Manual testing checklist ⏸
- [ ] Start app with valid .env → should start successfully
- [ ] Visit `http://localhost:3000/health` → should return health status
- [ ] Check health response includes DB status → should show "connected"
- [ ] Stop MongoDB → health should show DB disconnected
- [ ] Make 61 requests in 60s → 61st should return 429
- [ ] Frontend makes request → should succeed (CORS allows)
- [ ] Unknown origin makes request → should be blocked (CORS)
- [ ] Check response headers → should include Helmet security headers
- [ ] Start with missing env var → should fail with clear error
- [ ] Start with invalid MONGO_URI → should show connection error

**Validation**: All manual tests pass

#### 23. Performance testing ⏸
- [ ] Measure health endpoint response time (should be <50ms)
- [ ] Test with database query (health check response time)
- [ ] Verify rate limiting doesn't slow down normal requests
- [ ] Check memory usage is reasonable

**Validation**: Performance metrics are acceptable

### Phase 9: Cleanup & Finalization ⏸ NOT STARTED

#### 24. Remove boilerplate code ⏸
- [ ] Remove default "Hello World" endpoint from AppController (or keep as root)
- [ ] Clean up AppService if not needed
- [ ] Remove unused imports
- [ ] Verify all files follow project code style

**Validation**: Code is clean and follows standards

#### 25. Update .gitignore if needed ⏸
- [ ] Ensure `.env` is ignored (should already be)
- [ ] Ensure `node_modules/` is ignored (should already be)
- [ ] Add any new temporary files if needed

**Validation**: `.gitignore` is complete

---

## Dependencies Between Tasks

- Task 1, 2 → Task 3-6 (need packages before configuration)
- Task 3-6 → Task 7-8 (need config before database)
- Task 7-8 → Task 9-12 (need database for health checks)
- Task 13-16 → Task 17 (organize middleware after all are configured)
- All previous → Task 19-20 (document after implementation)
- All previous → Task 21-23 (test after everything is implemented)

## Parallelizable Tasks

- Tasks 13, 14, 15, 16 (middleware can be configured independently)
- Tasks 19 and 20 (documentation tasks are independent)
- Tasks 9-11 and 13-16 (health module and security can be done in parallel)

## Estimated Effort

- **Phase 1**: 30 minutes (install packages) ✅ COMPLETED
- **Phase 2**: 1-2 hours (environment configuration and validation) ✅ COMPLETED
- **Phase 3**: 1 hour (MongoDB setup and testing) ⏸ PENDING
- **Phase 4**: 2-3 hours (health endpoint with comprehensive checks) ⏸ PENDING
- **Phase 5**: 1-2 hours (security middleware) ⏸ PENDING
- **Phase 6**: 1 hour (code organization) ⏸ PENDING
- **Phase 7**: 1-2 hours (documentation updates) ⏸ PARTIALLY COMPLETED
- **Phase 8**: 2 hours (testing and validation) ⏸ PENDING
- **Phase 9**: 30 minutes (cleanup) ⏸ PENDING
- **Total**: ~11-15 hours

## Rollback Plan

If issues arise:
1. Revert main.ts to original boilerplate
2. Remove new modules (health, config)
3. Uninstall added packages
4. Remove .env files
5. Revert documentation changes

## Implementation Notes

### Completed Work

✅ **Phase 1 & 2 Completed Successfully**:
- All core dependencies installed without errors
- Environment configuration module created with TypeScript types
- ConfigModule properly configured with validation
- .env.example and .env files created
- Code quality automation working (linting, formatting, type-checking)
- Conventional Commits enforced

### Remaining Work

⏸ **Phases 3-9 Pending**:
- MongoDB integration (Phase 3)
- Health check module (Phase 4)
- Security middleware (Phase 5)
- Code organization (Phase 6)
- Documentation updates (Phase 7)
- Testing & validation (Phase 8)
- Cleanup (Phase 9)

### Next Steps

To continue implementation:
1. Add MongooseModule to AppModule with proper configuration
2. Create health module structure (health.module.ts, health.service.ts, health.controller.ts)
3. Implement health service with database, memory, and uptime checks
4. Update main.ts with security middleware (CORS, Helmet, validation pipe)
5. Add ThrottlerGuard for rate limiting
6. Create tests for health endpoints
7. Update README.md with comprehensive documentation
8. Perform manual and automated testing
