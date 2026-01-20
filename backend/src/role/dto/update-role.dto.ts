import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

/**
 * DTO for updating an existing role.
 * All fields are optional, name cannot be changed for protected roles.
 */
export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, [] as const),
) {}
