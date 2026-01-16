import { UserRole } from '../enums/user-role.enum';
import { AuthProvider } from '../enums/auth-provider.enum';

/**
 * DTO for user profile response.
 */
export class UserProfileDto {
  id!: string;
  email!: string;
  name!: string;
  role!: UserRole;
  authProvider!: AuthProvider;
  isVerified!: boolean;
  googleId?: string | null;
  facebookId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO for session information.
 */
export class SessionDto {
  id!: string;
  userAgent!: string;
  ip!: string;
  deviceName?: string;
  createdAt!: Date;
  lastUsedAt?: Date;
  isCurrent!: boolean;
}

/**
 * DTO for sessions list response.
 */
export interface SessionListData {
  sessions: SessionDto[];
  total: number;
}
