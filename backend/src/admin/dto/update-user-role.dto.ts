import { IsEnum, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/enums/user-role.enum';

/**
 * DTO for updating user role.
 * ADMIN role cannot be assigned via API.
 */
export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'New user role (ADMIN cannot be assigned via API)',
    enum: ['USER', 'SUPPORT', 'MANAGER'],
    example: 'MANAGER',
  })
  @IsEnum(UserRole)
  @IsIn([UserRole.USER, UserRole.SUPPORT, UserRole.MANAGER])
  role!: UserRole;
}
