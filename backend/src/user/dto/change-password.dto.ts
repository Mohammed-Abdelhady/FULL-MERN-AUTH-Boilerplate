import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for changing user password.
 * Requires current password verification.
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current user password for verification',
    example: 'OldPassword123',
  })
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  currentPassword!: string;

  @ApiProperty({
    description:
      'New password (min 8 chars, must contain lowercase, uppercase, and number)',
    example: 'NewPassword123',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'New password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  newPassword!: string;
}
