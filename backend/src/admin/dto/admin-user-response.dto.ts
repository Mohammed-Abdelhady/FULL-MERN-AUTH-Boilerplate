import { UserRole } from '../../user/enums/user-role.enum';
import { ApiResponse } from '../../common/dto/api-response.dto';

/**
 * Admin user DTO with all user fields (excluding password).
 */
export class AdminUserDto {
  id!: string;
  email!: string;
  name!: string;
  role!: UserRole;
  isVerified!: boolean;
  isDeleted!: boolean;
  googleId?: string | null;
  facebookId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Pagination metadata for user list responses.
 */
export class PaginationMetadata {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

/**
 * Response data for paginated user list.
 */
export interface UserListData {
  data: AdminUserDto[];
  pagination: PaginationMetadata;
}

/**
 * Response wrapper for paginated user list.
 */
export class UserListResponseDto {
  static success(
    input: UserListData,
    message?: string,
  ): ApiResponse<UserListData> {
    return ApiResponse.success(input, message);
  }
}

/**
 * Response wrapper for single user details.
 */
export class UserDetailResponseDto {
  static success(
    data: AdminUserDto,
    message?: string,
  ): ApiResponse<AdminUserDto> {
    return ApiResponse.success(data, message);
  }
}
