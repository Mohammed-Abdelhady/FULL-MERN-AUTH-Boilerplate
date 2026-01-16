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
@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * List all users with pagination and filtering.
   * Results are filtered based on the actor's role hierarchy.
   *
   * @example GET /admin/users?page=1&limit=10&search=john&role=user
   */
  @Get()
  @Roles(UserRole.SUPPORT, UserRole.MANAGER, UserRole.ADMIN)
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
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @CurrentUser('role') actorRole: UserRole,
  ): Promise<void> {
    return this.adminService.deleteUser(id, actorId, actorRole);
  }
}
