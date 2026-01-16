import { UserRole } from '../enums/user-role.enum';
import { AuthProvider } from '../enums/auth-provider.enum';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user profile response.
 */
export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'User role (USER, SUPPORT, MANAGER, ADMIN)',
    enum: ['USER', 'SUPPORT', 'MANAGER', 'ADMIN'],
    example: 'USER',
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Authentication provider (LOCAL, GOOGLE, FACEBOOK, GITHUB)',
    enum: ['LOCAL', 'GOOGLE', 'FACEBOOK', 'GITHUB'],
    example: 'LOCAL',
  })
  authProvider!: AuthProvider;

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: true,
  })
  isVerified!: boolean;

  @ApiProperty({
    description: 'Google OAuth ID (if authenticated via Google)',
    example: null,
    required: false,
  })
  googleId?: string | null;

  @ApiProperty({
    description: 'Facebook OAuth ID (if authenticated via Facebook)',
    example: null,
    required: false,
  })
  facebookId?: string | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt?: Date;
}

/**
 * DTO for session information.
 */
export class SessionDto {
  @ApiProperty({
    description: 'Session ID',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'User agent string from browser',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent!: string;

  @ApiProperty({
    description: 'IP address of session',
    example: '192.168.1.1',
  })
  ip!: string;

  @ApiProperty({
    description: 'Detected device name',
    example: 'Chrome on Windows',
    required: false,
  })
  deviceName?: string;

  @ApiProperty({
    description: 'Session creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2024-01-15T11:30:00.000Z',
    required: false,
  })
  lastUsedAt?: Date;

  @ApiProperty({
    description: 'Whether this is the current session',
    example: true,
  })
  isCurrent!: boolean;
}

/**
 * DTO for sessions list response.
 */
export class SessionListData {
  @ApiProperty({
    description: 'List of user sessions',
    type: [SessionDto],
  })
  sessions!: SessionDto[];

  @ApiProperty({
    description: 'Total number of sessions',
    example: 3,
  })
  total!: number;
}
