import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
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
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { AdminUserDto, UserListData } from './dto/admin-user-response.dto';
import { UserService } from '../user/user.service';
import { AddPermissionDto } from '../user/dto/add-permission.dto';
import {
  USER_PERMISSIONS,
  PERMISSION_PERMISSIONS,
} from '../common/constants/permissions';

/**
 * Admin controller for user management operations.
 * All endpoints require specific permissions based on the operation.
 */
@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin/users')
@UseGuards(AuthGuard, PermissionGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  /**
   * Create a new user.
   * Cannot create users with ADMIN role via API.
   *
   * @example POST /admin/users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(USER_PERMISSIONS.CREATE_ALL)
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user account. Cannot assign ADMIN role via API. ' +
      "Cannot create users with higher or equal role than actor's role.",
  })
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<ApiResponse<AdminUserDto>> {
    return this.adminService.createUser(dto, actorRole);
  }

  /**
   * List all users with pagination and filtering.
   * Results are filtered based on actor's role hierarchy.
   *
   * @example GET /admin/users?page=1&limit=10&search=john&role=user
   */
  @Get()
  @RequirePermissions(USER_PERMISSIONS.LIST_ALL)
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
  @RequirePermissions(USER_PERMISSIONS.READ_ALL)
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
   * Update user basic information (name, email).
   * Cannot modify users with higher or equal role.
   * Cannot modify own account.
   *
   * @example PATCH /admin/users/:id
   */
  @Patch(':id')
  @RequirePermissions(USER_PERMISSIONS.UPDATE_ALL)
  @ApiOperation({
    summary: 'Update user information',
    description:
      'Updates user name and/or email. Cannot modify users with higher or equal role. Cannot modify own account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<ApiResponse<AdminUserDto>> {
    return this.adminService.updateUser(id, dto, actorId, actorRole);
  }

  /**
   * Update user activation status (activate/deactivate).
   * Cannot modify users with higher or equal role.
   * Cannot modify own account.
   *
   * @example PATCH /admin/users/:id/status
   */
  @Patch(':id/status')
  @RequirePermissions(USER_PERMISSIONS.UPDATE_ALL)
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
  @RequirePermissions(USER_PERMISSIONS.UPDATE_ALL)
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
  @RequirePermissions(USER_PERMISSIONS.DELETE_ALL)
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

  /**
   * Get user permissions.
   * Only ADMIN can view user permissions.
   *
   * @example GET /admin/users/:id/permissions
   */
  @Get(':id/permissions')
  @RequirePermissions(PERMISSION_PERMISSIONS.READ_ALL)
  @ApiOperation({
    summary: 'Get user permissions',
    description: 'Returns all permissions assigned to a specific user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  async getUserPermissions(
    @Param('id') userId: string,
  ): Promise<
    ApiResponse<{ userId: string; permissions: string[]; role: string }>
  > {
    return this.userService.getUserPermissions(userId);
  }

  /**
   * Add permission to user.
   * Only ADMIN can add permissions.
   *
   * @example POST /admin/users/:id/permissions
   */
  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSION_PERMISSIONS.GRANT_ALL)
  @ApiOperation({
    summary: 'Add permission to user',
    description:
      'Adds a specific permission to a user. The permission must follow the format: resource:action[:scope]',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: AddPermissionDto })
  async addPermission(
    @Param('id') userId: string,
    @Body() dto: AddPermissionDto,
  ): Promise<ApiResponse<{ userId: string; permissions: string[] }>> {
    return this.userService.addPermission(userId, dto.permission);
  }

  /**
   * Remove permission from user.
   * Only ADMIN can remove permissions.
   *
   * @example DELETE /admin/users/:id/permissions/:permission
   */
  @Delete(':id/permissions/:permission')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSION_PERMISSIONS.REVOKE_ALL)
  @ApiOperation({
    summary: 'Remove permission from user',
    description: 'Removes a specific permission from a user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'permission',
    description: 'Permission to remove (URL encoded)',
    example: 'users:read:all',
  })
  async removePermission(
    @Param('id') userId: string,
    @Param('permission') permission: string,
  ): Promise<ApiResponse<{ userId: string; permissions: string[] }>> {
    // URL decode the permission parameter
    const decodedPermission = decodeURIComponent(permission);
    return this.userService.removePermission(userId, decodedPermission);
  }
}
