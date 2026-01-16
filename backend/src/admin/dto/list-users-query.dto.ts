import {
  IsOptional,
  IsInt,
  IsString,
  IsIn,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../user/enums/user-role.enum';

/**
 * Query parameters for listing users with pagination and filtering.
 */
export class ListUsersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([UserRole.USER, UserRole.SUPPORT, UserRole.MANAGER, UserRole.ADMIN])
  role?: UserRole;

  @IsOptional()
  @IsIn(['active', 'inactive', 'deleted'])
  status?: 'active' | 'inactive' | 'deleted';

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'name', 'email'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
