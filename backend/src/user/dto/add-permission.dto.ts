import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding a permission to a user.
 */
export class AddPermissionDto {
  @ApiProperty({
    description: 'Permission to add (format: resource:action[:scope])',
    example: 'users:read:all',
  })
  @IsString()
  @IsNotEmpty()
  permission!: string;
}
