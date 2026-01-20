import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for user permissions.
 */
export class UserPermissionsResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId!: string;

  @ApiProperty({
    description: 'Array of user permissions',
    example: ['profile:read:own', 'profile:update:own', 'users:read:all'],
    type: [String],
  })
  permissions!: string[];

  @ApiProperty({
    description: 'User role slug',
    example: 'user',
  })
  role!: string;
}
