import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for updating user activation status.
 */
export class UpdateUserStatusDto {
  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
