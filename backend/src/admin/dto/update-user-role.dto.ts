import { IsEnum, IsIn } from 'class-validator';
import { UserRole } from '../../user/enums/user-role.enum';

/**
 * DTO for updating user role.
 * ADMIN role cannot be assigned via API.
 */
export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  @IsIn([UserRole.USER, UserRole.SUPPORT, UserRole.MANAGER])
  role!: UserRole;
}
