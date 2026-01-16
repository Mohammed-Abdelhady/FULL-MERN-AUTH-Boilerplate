$(cat /tmp/readme_before.txt)

## Database Models

The application uses Mongoose schemas for data persistence with the following models:

### User Model

Location: \`src/user/schemas/user.schema.ts\`

The User model stores user account information with support for OAuth authentication and role-based access control.

**Fields:**

- \`email\` (string, required, unique, lowercase) - User's email address
- \`password\` (string, required, hidden) - Hashed password
- \`name\` (string, required) - User's display name
- \`role\` (enum, default: 'user') - User role: 'user' or 'admin'
- \`googleId\` (string, optional, sparse, unique) - Google OAuth ID
- \`facebookId\` (string, optional, sparse, unique) - Facebook OAuth ID
- \`isVerified\` (boolean, default: false) - Email verification status
- \`verificationToken\` (string, optional) - Email verification token
- \`verificationExpires\` (Date, optional) - Email verification expiration
- \`resetPasswordToken\` (string, optional) - Password reset token
- \`resetPasswordExpires\` (Date, optional) - Password reset expiration
- \`isDeleted\` (boolean, default: false) - Soft delete flag
- \`deletedAt\` (Date, optional) - Soft delete timestamp
- \`createdAt\` (Date, auto) - Account creation timestamp
- \`updatedAt\` (Date, auto) - Last update timestamp

**Indexes:**

- Unique index on \`email\` field
- Sparse index on \`googleId\` field
- Sparse index on \`facebookId\` field
- Descending index on \`createdAt\` field
- Index on \`isDeleted\` field

**Relationships:**

- One-to-many with Session model (user has multiple sessions)
- One-to-many with Permission model (user has permission overrides)

---

### Session Model

Location: \`src/session/schemas/session.schema.ts\`

The Session model tracks refresh tokens per device for secure authentication with device management.

**Fields:**

- \`user\` (ObjectId, required, ref: 'User') - Reference to User
- \`refreshToken\` (string, required, unique) - JWT refresh token
- \`userAgent\` (string, optional) - Browser/device user agent
- \`ip\` (string, optional) - Client IP address
- \`deviceName\` (string, optional) - Device name (e.g., "Chrome on Windows")
- \`isValid\` (boolean, default: true) - Session validity status
- \`lastUsedAt\` (Date, optional) - Last usage timestamp
- \`expiresAt\` (Date, required) - Token expiration time
- \`createdAt\` (Date, auto) - Session creation timestamp
- \`updatedAt\` (Date, auto) - Last update timestamp

**Indexes:**

- Index on \`user\` field
- Unique index on \`refreshToken\` field
- TTL index on \`expiresAt\` field (auto-cleanup)
- Compound index on \`user + userAgent\` fields

**Features:**

- Automatic cleanup of expired sessions via TTL index
- Device tracking for "logout from all devices" functionality
- Session invalidation support

---

### Permission Model

Location: \`src/permission/schemas/permission.schema.ts\`

The Permission model provides fine-grained access control beyond simple role-based system.

**Fields:**

- \`user\` (ObjectId, required, ref: 'User') - Reference to User
- \`permission\` (string, required) - Permission string (format: \`resource:action\`)
- \`granted\` (boolean, required) - Permission granted status
- \`scope\` (enum, optional) - Permission scope: 'own', 'all', or 'team'
- \`grantedBy\` (ObjectId, optional, ref: 'User') - Admin who granted permission
- \`expiresAt\` (Date, optional) - Permission expiration time
- \`createdAt\` (Date, auto) - Permission creation timestamp
- \`updatedAt\` (Date, auto) - Last update timestamp

**Indexes:**

- Index on \`user\` field
- Compound unique index on \`user + permission\` fields
- Optional TTL index on \`expiresAt\` field

**Permission Format:**

- Format: \`resource:action\`
- Resources: \`profile\`, \`users\`, \`sessions\`, \`permissions\`
- Actions: \`read\`, \`create\`, \`update\`, \`delete\`, \`list\`
- Scopes: \`own\` (user's resources), \`all\` (all resources), \`team\` (team resources)

**Default Permissions:**

- Regular users: \`profile:read\`, \`profile:update\`
- Admin users: \`\*\` (all permissions)

See \`src/permission/constants/default-permissions.ts\` for permission constants.

---

### Model Relationships

\`\`\`
┌─────────────────────────────────────────────────┐
│ User │
│ \_id, email, password, name, role, isVerified, ... │
│ googleId?, facebookId?, isDeleted, deletedAt? │
└─────────────────────┬───────────────────────────────────┘
│
┌────────────┼────────────┐
│ │ │
▼ ▼ ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐
│ Session │ │ Session │ │ Permission │
│ Device1 │ │ Device2 │ │ (override) │
└─────────┘ └─────────┘ └──────────────┘
\`\`\`

---

### Query Examples

**Find user by email:**
\`\`\`typescript
const user = await this.userModel.findOne({ email, isDeleted: false });
\`\`\`

**Find active sessions for user:**
\`\`\`typescript
const sessions = await this.sessionModel.find({ user: userId, isValid: true });
\`\`\`

**Check user permission:**
\`\`\`typescript
const permission = await this.permissionModel.findOne({ user: userId, permission: 'users:read', granted: true });
\`\`\`

**Soft delete user:**
\`\`\`typescript
await this.userModel.findByIdAndUpdate(userId, { isDeleted: true, deletedAt: new Date() });
\`\`\`

---

## License

[Nest is MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
