import { ApiProperty } from '@nestjs/swagger';

/**
 * Standardized user response DTO
 * Used across auth and user modules for consistent API responses
 */
export class UserResponseDto {
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
    example: 'USER',
  })
  role!: string;

  /**
   * Create a UserResponseDto from a user document
   * @param user - User document with _id, email, name, role
   */
  static fromDocument(user: {
    _id: { toString(): string };
    email: string;
    name: string;
    role: string;
  }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user._id.toString();
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    return dto;
  }
}
