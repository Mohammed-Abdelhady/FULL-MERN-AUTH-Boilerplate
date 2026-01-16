import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { AdminUserDto, UserListData } from './dto/admin-user-response.dto';

/**
 * Admin controller for user management operations.
 * All endpoints require SUPPORT, MANAGER, or ADMIN roles.
 */
@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * List all users with pagination and filtering.
   * Results are filtered based on actor's role hierarchy.
   *
   * @example GET /admin/users?page=1&limit=10&search=john&role=user
   */
  @Get()
  @Roles(UserRole.SUPPORT, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'List all users',
    description:
      'Returns a paginated list of users with optional filtering by search, role, and status. ' +
      "Results are filtered based on actor's role hierarchy.",
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by email or name',
    example: 'john',
    type: String,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by role',
    enum: ['USER', 'SUPPORT', 'MANAGER', 'ADMIN'],
    example: 'USER',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (active, deleted)',
    enum: ['active', 'deleted'],
    example: 'active',
    type: String,
  })
  async listUsers(
    @Query() query: ListUsersQueryDto,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<ApiResponse<UserListData>> {
    return this.adminService.listUsers(query, actorRole);
  }

  /**
   * Get a single user by ID.
   * Only users with same or lower role can be viewed.
   *
   * @example GET /admin/users/:id
   */
  @Get(':id')
  @Roles(UserRole.SUPPORT, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Returns detailed information about a specific user. ' +
      'Only users with same or lower role can be viewed.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  async getUserById(
    @Param('id') id: string,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<ApiResponse<AdminUserDto>> {
    return this.adminService.getUserById(id, actorRole);
  }

  /**
   * Update user activation status (activate/deactivate).
   * Cannot modify users with higher or equal role.
   * Cannot modify own account.
   *
   * @example PATCH /admin/users/:id/status
   */
  @Patch(':id/status')
  @Roles(UserRole.SUPPORT, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update user status',
    description:
      'Updates the activation status of a user (activate or deactivate). ' +
      'Cannot modify users with higher or equal role. Cannot modify own account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateUserStatusDto })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<
    ApiResponse<{ id: string; isDeleted: boolean; deletedAt?: Date }>
  > {
    return this.adminService.updateUserStatus(id, dto, actorId, actorRole);
  }

  /**
   * Update user role.
   * Cannot assign ADMIN role via API.
   * Cannot modify users with higher or equal role.
   * Cannot modify own role.
   *
   * @example PATCH /admin/users/:id/role
   */
  @Patch(':id/role')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update user role',
    description:
      'Updates the role of a user. Cannot assign ADMIN role via API. ' +
      'Cannot modify users with higher or equal role. Cannot modify own role.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<ApiResponse<{ id: string; role: UserRole }>> {
    return this.adminService.updateUserRole(id, dto, actorId, actorRole);
  }

  /**
   * Soft delete a user.
   * Cannot delete users with higher or equal role.
   * Cannot delete own account.
   *
   * @example DELETE /admin/users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete user',
    description:
      'Soft deletes a user account. Cannot delete users with higher or equal role. Cannot delete own account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<void> {
    return this.adminService.deleteUser(id, actorId, actorRole);
  }
}
