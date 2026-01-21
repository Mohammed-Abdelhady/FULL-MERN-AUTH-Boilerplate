# Database Schema Design

## Overview

This document defines the complete database schema for the authentication boilerplate with role-based access control (RBAC) and session management.

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     USER     │◄──────│  PERMISSION  │       │     ROLE     │
│              │ 1   * │              │       │              │
│ - _id        │       │ - _id        │       │ - _id        │
│ - email      │       │ - user (FK)  │       │ - name       │
│ - name       │       │ - permission │       │ - slug       │
│ - role (FK)  │──────►│ - granted    │       │ - permissions│
│ - password   │ *   1 │ - scope      │       │ - description│
│ - isVerified │       │ - grantedBy  │       └──────────────┘
└──────┬───────┘       │ - expiresAt  │              ▲
       │               └──────────────┘              │
       │ 1                                           │
       │                                             │
       │ *                                         * │
┌──────▼───────┐                                     │
│   SESSION    │                                     │
│              │                           User.role references
│ - _id        │                           Role._id (optional)
│ - user (FK)  │
│ - token      │
│ - userAgent  │
│ - device     │
│ - ip         │
│ - isValid    │
│ - expiresAt  │
└──────────────┘
```

## Table Definitions

### 1. Users Table

**Purpose**: Core user accounts with authentication and profile data.

**Schema**:

```typescript
{
  _id: ObjectId,                    // Primary Key
  email: string,                    // Unique, required, lowercase, trimmed
  password: string,                 // Bcrypt hashed, select: false
  name: string,                     // Required, trimmed

  // RBAC
  role: ObjectId | string,          // Reference to Role._id OR string for simple RBAC
  permissions: string[],            // Direct permission overrides (optional)

  // Authentication Providers
  authProvider: 'email' | 'google' | 'facebook' | 'github',
  googleId: string,                 // Unique, sparse index
  facebookId: string,               // Unique, sparse index
  githubId: string,                 // Unique, sparse index
  linkedProviders: string[],        // All linked OAuth providers
  primaryProvider: AuthProvider,    // Primary login method

  // Email Verification
  isVerified: boolean,              // Default: false
  verificationToken: string,        // JWT or random token
  verificationExpires: Date,        // Expiration timestamp

  // Password Reset
  resetPasswordToken: string,       // JWT or random token
  resetPasswordExpires: Date,       // Expiration timestamp

  // Soft Delete
  isDeleted: boolean,               // Default: false
  deletedAt: Date,                  // Soft delete timestamp

  // OAuth Sync
  profileSyncedAt: Date,            // Last profile sync with OAuth provider
  lastSyncedProvider: string,       // Provider that triggered last sync

  // Timestamps
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

**Indexes**:

```javascript
{ email: 1 } unique
{ role: 1 }
{ googleId: 1 } sparse, unique
{ facebookId: 1 } sparse, unique
{ githubId: 1 } sparse, unique
{ createdAt: -1 }
{ isDeleted: 1, deletedAt: 1 }
{ linkedProviders: 1 }
```

**Constraints**:

- Email must be unique and valid format
- Password required for email provider, optional for OAuth
- At least one OAuth ID required if authProvider != 'email'

---

### 2. Roles Table

**Purpose**: Define reusable permission sets for role-based access control.

**Schema**:

```typescript
{
  _id: ObjectId,                    // Primary Key
  name: string,                     // Human-readable name (e.g., "Administrator")
  slug: string,                     // URL-safe identifier (e.g., "admin"), unique, lowercase
  description: string,              // Optional role description

  // Permission Set
  permissions: string[],            // Array of permission strings
                                    // Format: "resource:action:scope"
                                    // Examples: "users:read:all", "profile:update:own"

  // System Flags
  isSystemRole: boolean,            // Default: false, marks built-in roles
  isProtected: boolean,             // Default: false, prevents deletion

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

```javascript
{
  slug: 1;
}
unique;
{
  isSystemRole: 1;
}
{
  createdAt: -1;
}
```

**Pre-Save Hooks**:

- Auto-lowercase `slug` field
- Validate permission format with regex: `/^([a-z-]+:[a-z-]+(:[a-z-]+)?|\*)$/`

**Default Roles**:

| Slug        | Name          | Permissions                              | Protected |
| ----------- | ------------- | ---------------------------------------- | --------- |
| `user`      | User          | `profile:read:own`, `profile:update:own` | Yes       |
| `admin`     | Administrator | `*` (all permissions)                    | Yes       |
| `moderator` | Moderator     | `users:read:all`, `users:update:all`     | No        |

---

### 3. Permissions Table

**Purpose**: User-specific permission grants/revokes with expiration and audit trail.

**Schema**:

```typescript
{
  _id: ObjectId,                    // Primary Key
  user: ObjectId,                   // Foreign Key → User._id, required
  permission: string,               // Permission identifier, required
                                    // Format: "resource:action" or "resource:action:scope"

  // Grant/Revoke
  granted: boolean,                 // true = grant, false = explicit revoke
  scope: 'own' | 'all' | 'team',    // Permission scope level

  // Audit & Expiration
  grantedBy: ObjectId,              // Foreign Key → User._id (admin who granted)
  expiresAt: Date,                  // Optional expiration for temporary permissions

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

```javascript
{ user: 1 }                         // Query user's permissions
{ user: 1, permission: 1 } unique   // Prevent duplicate grants
{ expiresAt: 1 } TTL                // Auto-delete expired permissions
{ user: 1, granted: 1 }             // Fast permission checks
```

**TTL Index**:

- `expiresAt` with `expireAfterSeconds: 0` auto-removes expired permissions

**Permission Resolution Logic**:

```
User Effective Permissions =
  Role.permissions[]
  + Permission[granted=true].permission
  - Permission[granted=false].permission
```

**Examples**:

| User  | Role  | Role Perms      | Direct Grants    | Direct Revokes     | Final Permissions                 |
| ----- | ----- | --------------- | ---------------- | ------------------ | --------------------------------- |
| Alice | user  | `profile:*:own` | `users:read:all` | -                  | `profile:*:own`, `users:read:all` |
| Bob   | admin | `*`             | -                | `users:delete:all` | `*` except `users:delete:all`     |

---

### 4. Sessions Table

**Purpose**: Track active user sessions with device info for security and logout management.

**Schema**:

```typescript
{
  _id: ObjectId,                    // Primary Key
  user: ObjectId,                   // Foreign Key → User._id, required

  // Token
  refreshToken: string,             // Unique crypto-random token (32+ bytes)

  // Device Information (parsed from userAgent)
  userAgent: string,                // Raw user agent string
  device: {
    type: 'mobile' | 'tablet' | 'desktop' | 'unknown',
    browser: string,                // e.g., "Chrome 120.0"
    os: string,                     // e.g., "Windows 10"
    name: string                    // Human-readable: "Chrome on Windows"
  },
  deviceName: string,               // Optional custom name: "John's iPhone"

  // Location
  ip: string,                       // IPv4/IPv6 address, required
  location: {                       // Optional geolocation
    country: string,
    city: string,
    region: string
  },

  // Session State
  isValid: boolean,                 // Default: true, false = invalidated/logged out
  lastUsedAt: Date,                 // Updated on token refresh
  expiresAt: Date,                  // Session expiration timestamp

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

```javascript
{ user: 1 }                         // Query user's sessions
{ user: 1, userAgent: 1 }           // Detect duplicate devices
{ refreshToken: 1 } unique          // Fast token lookup
{ expiresAt: 1 } TTL                // Auto-delete expired sessions
{ user: 1, isValid: 1 }             // List active sessions
```

**TTL Index**:

- `expiresAt` with `expireAfterSeconds: 0` auto-removes expired sessions

**Session Lifecycle**:

1. **Create**: Generate crypto-random token, parse userAgent, set expiration
2. **Validate**: Check `isValid && expiresAt > now`, update `lastUsedAt`
3. **Invalidate**: Set `isValid = false` (logout)
4. **Expire**: TTL index auto-deletes after `expiresAt`

---

## Design Decisions

### RBAC Strategy: Hybrid Model

**Approach**: Combine role-based permissions with user-specific overrides.

**Why**:

- **Roles**: Simplify management for common permission sets
- **User Permissions**: Allow fine-grained control without creating new roles
- **Explicit Revokes**: Support exceptions (e.g., admin without delete rights)

**Alternatives Considered**:

- Pure RBAC (no user permissions) - Too rigid
- Pure ACL (no roles) - High maintenance overhead

### User.role: String vs ObjectId

**Current**: `role: string` (simple, no FK constraint)

**Recommended**: Keep as `string` for MVP, migrate to ObjectId for production.

**Migration Path**:

```typescript
// Phase 1: Simple string-based roles (current)
role: 'user' | 'admin' | 'moderator'

// Phase 2: Reference to Role table (future)
role: ObjectId ref 'Role'

// Migration script:
// 1. Create Role documents for all existing role strings
// 2. Update User.role from string to ObjectId reference
// 3. Add foreign key constraint
```

**Trade-offs**:

| Approach      | Pros                                     | Cons                            |
| ------------- | ---------------------------------------- | ------------------------------- |
| String        | Simple, fast queries, easy to understand | No validation, can't cascade    |
| ObjectId (FK) | Referential integrity, role reusability  | Requires JOIN, migration needed |

### Session.device: Embedded vs Parsed

**Decision**: Store both raw `userAgent` and parsed `device` object.

**Why**:

- Raw userAgent for debugging and re-parsing
- Parsed device for UI display (device icons, human-readable names)
- Parse on session creation with `parseUserAgent()` utility (already exists: `frontend/src/lib/parseUserAgent.ts`)

---

## Permission Format

**Standard**: `resource:action:scope`

**Examples**:

| Permission            | Description                        |
| --------------------- | ---------------------------------- |
| `*`                   | Wildcard (all permissions)         |
| `users:read:all`      | Read all users                     |
| `users:update:own`    | Update own user profile            |
| `users:delete:all`    | Delete any user                    |
| `roles:manage:all`    | Manage all roles                   |
| `sessions:read:own`   | Read own active sessions           |
| `sessions:delete:all` | Delete any user's sessions (admin) |

**Validation Regex**: `/^([a-z-]+:[a-z-]+(:[a-z-]+)?|\*)$/`

**Resources**:

- `profile` - User's own profile
- `users` - All users (admin)
- `roles` - Role management
- `permissions` - Permission grants
- `sessions` - Session management
- `reports` - Reporting (future)

**Actions**:

- `read` - View/fetch data
- `list` - List all records
- `create` - Create new records
- `update` - Modify existing records
- `delete` - Remove records
- `manage` - Full CRUD (shorthand for create+read+update+delete)

**Scopes**:

- `own` - User's own data only
- `team` - User's team/organization (future)
- `all` - All records (admin)

---

## Security Considerations

### 1. Password Storage

- Use bcrypt with work factor ≥ 10
- Mark password field with `select: false` to prevent accidental exposure
- Never log passwords in plaintext

### 2. Token Generation

- Refresh tokens: Use `crypto.randomBytes(32)` for session tokens
- Email verification/password reset: Use short-lived JWT tokens (15min-1hour)

### 3. Session Security

- httpOnly cookies for token storage (prevent XSS)
- Implement CSRF protection
- Auto-invalidate sessions on password change
- Rate limit login attempts (5 attempts per 15min per IP)

### 4. Permission Checks

- Always check permissions on both frontend (UI) and backend (API)
- Use `PermissionGuard` for route protection
- Validate permission format server-side

### 5. Soft Delete

- Never hard delete users (breaks foreign keys)
- Set `isDeleted = true` and `deletedAt = now`
- Filter deleted users in queries: `{ isDeleted: false }`

---

## Query Patterns

### Get User with Role Permissions

```typescript
const user = await User.findById(userId).populate('role');
const rolePermissions = user.role?.permissions || [];
const directPermissions = await Permission.find({
  user: userId,
  granted: true,
}).select('permission');
const effectivePermissions = [...rolePermissions, ...directPermissions.map((p) => p.permission)];
```

### Check User Permission

```typescript
async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const user = await User.findById(userId).populate('role');

  // Check role permissions
  if (user.role?.permissions.includes('*') || user.role?.permissions.includes(permission)) {
    // Check for explicit revoke
    const revoked = await Permission.findOne({
      user: userId,
      permission,
      granted: false,
    });
    if (revoked) return false;
    return true;
  }

  // Check direct grant
  const granted = await Permission.findOne({
    user: userId,
    permission,
    granted: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
  });
  return !!granted;
}
```

### List Active Sessions for User

```typescript
const sessions = await Session.find({
  user: userId,
  isValid: true,
  expiresAt: { $gt: new Date() },
}).sort({ lastUsedAt: -1 });
```

### Invalidate All Other Sessions (Logout All Devices)

```typescript
const result = await Session.updateMany(
  {
    user: userId,
    _id: { $ne: currentSessionId },
    isValid: true,
  },
  { $set: { isValid: false } },
);
```

---

## Migration Plan

### Phase 1: Current State (MVP)

- ✅ String-based roles
- ✅ User permissions table for overrides
- ✅ Session tracking
- ✅ TTL indexes for auto-cleanup

### Phase 2: Enhanced RBAC (Production)

- [ ] Migrate `User.role` from string to ObjectId reference
- [ ] Add `UserRole` junction table for multi-role support
- [ ] Implement role hierarchy (admin > moderator > user)

### Phase 3: Advanced Features

- [ ] Team/organization scopes
- [ ] Permission bundles (groups of permissions)
- [ ] Audit log for permission changes
- [ ] Geolocation for sessions (IP → city/country)
- [ ] Session analytics (login patterns, device trends)

---

## API Endpoints

### User Management

```
GET    /api/users              # List all users (admin)
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create user (admin)
PATCH  /api/users/:id          # Update user
DELETE /api/users/:id          # Soft delete user (admin)
GET    /api/users/:id/sessions # Get user's sessions (admin or self)
```

### Role Management

```
GET    /api/roles              # List all roles
GET    /api/roles/:slug        # Get role by slug
POST   /api/roles              # Create role (admin)
PATCH  /api/roles/:slug        # Update role (admin)
DELETE /api/roles/:slug        # Delete role (admin, if not protected)
```

### Permission Management

```
GET    /api/permissions/user/:userId  # Get user's permissions
POST   /api/permissions/grant          # Grant permission (admin)
POST   /api/permissions/revoke         # Revoke permission (admin)
DELETE /api/permissions/:id            # Remove permission grant (admin)
```

### Session Management

```
GET    /api/sessions           # Get current user's sessions
DELETE /api/sessions/:id       # Logout specific session
DELETE /api/sessions/all       # Logout all other sessions
```

---

## Testing Checklist

### Schema Validation

- [ ] User email must be unique
- [ ] Role slug must be unique and lowercase
- [ ] Permission format validation (regex)
- [ ] Session refreshToken uniqueness

### Permission Logic

- [ ] User inherits role permissions
- [ ] Direct grants override role
- [ ] Explicit revokes override grants
- [ ] Expired permissions auto-delete

### Session Management

- [ ] Sessions auto-expire via TTL index
- [ ] Invalid sessions rejected
- [ ] lastUsedAt updates on token refresh
- [ ] Logout all other devices works

### Security

- [ ] Passwords hashed with bcrypt
- [ ] Tokens generated with crypto.randomBytes
- [ ] Soft delete preserves foreign keys
- [ ] Rate limiting on auth endpoints

---

## References

- **Permission Constants**: `frontend/src/modules/permissions/constants/permissions.ts`
- **User Schema**: `backend/src/user/schemas/user.schema.ts`
- **Role Schema**: `backend/src/role/schemas/role.schema.ts`
- **Permission Schema**: `backend/src/permission/schemas/permission.schema.ts`
- **Session Schema**: `backend/src/session/schemas/session.schema.ts`
- **User Agent Parser**: `frontend/src/lib/parseUserAgent.ts`
