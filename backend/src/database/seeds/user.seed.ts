/**
 * Seed User Data Interface
 *
 * Defines the structure for seed user data.
 * Passwords will be hashed during seeding process.
 */
export interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: string;
  permissions: string[];
}

/**
 * Seed Users
 *
 * This array contains seed users for each role.
 * All users use the @seed.local domain for easy identification.
 *
 * Password Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 *
 * @example
 * ```typescript
 * import { SEED_USERS } from './user.seed';
 * console.log(SEED_USERS[0].email); // 'user@seed.local'
 * ```
 */
export const SEED_USERS: SeedUser[] = [
  {
    email: 'user@seed.local',
    password: 'User123!',
    name: 'Seed User',
    role: 'user',
    permissions: ['profile:read:own', 'profile:update:own'],
  },
  {
    email: 'support@seed.local',
    password: 'Support123!',
    name: 'Seed Support',
    role: 'support',
    permissions: [
      'profile:read:own',
      'profile:update:own',
      'users:read:all',
      'sessions:read:all',
    ],
  },
  {
    email: 'manager@seed.local',
    password: 'Manager123!',
    name: 'Seed Manager',
    role: 'manager',
    permissions: [
      'profile:read:own',
      'profile:update:own',
      'users:read:all',
      'users:update:all',
      'sessions:read:all',
      'roles:read:all',
    ],
  },
  {
    email: 'admin@seed.local',
    password: 'Admin123!',
    name: 'Seed Admin',
    role: 'admin',
    permissions: ['*'],
  },
];

/**
 * Seed User Credentials Reference
 *
 * This object provides quick access to seed user credentials.
 * Useful for documentation and testing.
 *
 * @example
 * ```typescript
 * import { SEED_CREDENTIALS } from './user.seed';
 * const adminCreds = SEED_CREDENTIALS.admin;
 * console.log(adminCreds.email); // 'admin@seed.local'
 * console.log(adminCreds.password); // 'Admin123!'
 * ```
 */
export const SEED_CREDENTIALS = {
  user: {
    email: 'user@seed.local',
    password: 'User123!',
    role: 'user',
  },
  support: {
    email: 'support@seed.local',
    password: 'Support123!',
    role: 'support',
  },
  manager: {
    email: 'manager@seed.local',
    password: 'Manager123!',
    role: 'manager',
  },
  admin: {
    email: 'admin@seed.local',
    password: 'Admin123!',
    role: 'admin',
  },
} as const;

/**
 * Seed User Emails
 *
 * Array of all seed user emails for easy reference.
 */
export const SEED_EMAILS = SEED_USERS.map((user) => user.email);
