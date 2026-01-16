import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for updating user profile.
 * All fields are optional - only provided fields are updated.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;
}
