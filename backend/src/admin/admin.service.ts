import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserRole } from '../user/enums/user-role.enum';
import { SessionService } from '../auth/services/session.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { AdminUserDto, UserListData } from './dto/admin-user-response.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/enums/error-code.enum';
import {
  canManageUser,
  canViewUser,
  getViewableRoles,
  isValidRoleAssignment,
} from '../common/utils/role-hierarchy';
import { ApiResponse } from '../common/dto/api-response.dto';

/**
 * Admin service for user management operations.
 * Provides listing, status updates, role changes, and deletion capabilities.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * List users with pagination and filtering.
   * Results are filtered based on actor's role hierarchy.
   */
  async listUsers(
    query: ListUsersQueryDto,
    actorRole: UserRole,
  ): Promise<ApiResponse<UserListData>> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Get viewable roles based on actor's role hierarchy
    const viewableRoles = getViewableRoles(actorRole);

    // Build base query
    const filterQuery: Record<string, unknown> = {};

    // Filter by viewable roles (role hierarchy enforcement)
    filterQuery.role = { $in: viewableRoles };

    // Add text search
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Add role filter (only if it's within viewable roles)
    if (role && viewableRoles.includes(role)) {
      filterQuery.role = role;
    }

    // Add verification status filter
    if (isVerified !== undefined) {
      filterQuery.isVerified = isVerified;
    }

    // Add status filter
    if (status === 'deleted') {
      filterQuery.isDeleted = true;
    } else if (status === 'inactive') {
      filterQuery.isVerified = false;
      filterQuery.isDeleted = false;
    } else if (status === 'active') {
      filterQuery.isVerified = true;
      filterQuery.isDeleted = false;
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [users, total] = await Promise.all([
      this.userModel
        .find(filterQuery)
        .select(
          '-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires',
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    this.logger.log(
      `Listed ${users.length} users (page ${page}, total ${total})`,
    );

    return ApiResponse.success({
      data: users.map((user) => this.mapToAdminUserDto(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }

  /**
   * Get single user by ID.
   * Enforces role hierarchy - can only view users with same or lower role.
   */
  async getUserById(
    id: string,
    actorRole: UserRole,
  ): Promise<ApiResponse<AdminUserDto>> {
    const user = await this.userModel
      .findById(id)
      .select(
        '-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires',
      )
      .exec();

    if (!user || user.isDeleted) {
      this.logger.warn(`User not found or deleted: ${id}`);
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if actor can view this user based on role hierarchy
    if (!canViewUser(actorRole, user.role)) {
      this.logger.warn(
        `Access denied: ${actorRole} cannot view ${user.role} user`,
      );
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_HIGHER_ROLE,
        'Cannot view user with higher role',
        HttpStatus.FORBIDDEN,
      );
    }

    this.logger.log(`Retrieved user: ${user.email}`);
    return ApiResponse.success(this.mapToAdminUserDto(user));
  }

  /**
   * Update user activation status.
   */
  async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    actorId: string,
    actorRole: UserRole,
  ): Promise<
    ApiResponse<{ id: string; isDeleted: boolean; deletedAt?: Date }>
  > {
    const { isActive } = dto;

    // Find target user
    const targetUser = await this.userModel.findById(id).exec();
    if (!targetUser || targetUser.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if trying to modify self
    if (id === actorId) {
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_SELF,
        'Cannot modify your own account',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if actor can manage target
    if (!canManageUser(actorRole, targetUser.role)) {
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_HIGHER_ROLE,
        'Cannot modify user with higher or equal role',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update user status
    if (isActive) {
      targetUser.isDeleted = false;
      targetUser.deletedAt = undefined;
    } else {
      targetUser.isDeleted = true;
      targetUser.deletedAt = new Date();
    }

    await targetUser.save();

    // Invalidate sessions if deactivating
    if (!isActive) {
      await this.sessionService.invalidateAllSessions(new Types.ObjectId(id));
    }

    this.logger.log(
      `User ${id} status updated to ${isActive ? 'active' : 'inactive'} by ${actorId}`,
    );

    return ApiResponse.success({
      id: targetUser._id.toString(),
      isDeleted: targetUser.isDeleted,
      deletedAt: targetUser.deletedAt,
    });
  }

  /**
   * Update user role.
   */
  async updateUserRole(
    id: string,
    dto: UpdateUserRoleDto,
    actorId: string,
    actorRole: UserRole,
  ): Promise<ApiResponse<{ id: string; role: UserRole }>> {
    const { role: newRole } = dto;

    // Find target user
    const targetUser = await this.userModel.findById(id).exec();
    if (!targetUser || targetUser.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if trying to modify self
    if (id === actorId) {
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_SELF,
        'Cannot modify your own role',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if role assignment is valid
    if (!isValidRoleAssignment(newRole)) {
      throw new AppException(
        ErrorCode.INVALID_ROLE_ASSIGNMENT,
        'Cannot assign ADMIN role via API',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if actor can manage target
    if (!canManageUser(actorRole, targetUser.role)) {
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_HIGHER_ROLE,
        'Cannot modify user with higher or equal role',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update user role
    targetUser.role = newRole;
    await targetUser.save();

    // Invalidate sessions to force re-authentication
    await this.sessionService.invalidateAllSessions(new Types.ObjectId(id));

    this.logger.log(`User ${id} role changed to ${newRole} by ${actorId}`);

    return ApiResponse.success({
      id: targetUser._id.toString(),
      role: newRole,
    });
  }

  /**
   * Soft delete user.
   */
  async deleteUser(
    id: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<void> {
    // Find target user
    const targetUser = await this.userModel.findById(id).exec();
    if (!targetUser || targetUser.isDeleted) {
      throw new AppException(
        ErrorCode.USER_ALREADY_DELETED,
        'User not found or already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if trying to delete self
    if (id === actorId) {
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_SELF,
        'Cannot delete your own account',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if actor can manage target
    if (!canManageUser(actorRole, targetUser.role)) {
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_HIGHER_ROLE,
        'Cannot delete user with higher or equal role',
        HttpStatus.FORBIDDEN,
      );
    }

    // Soft delete user
    targetUser.isDeleted = true;
    targetUser.deletedAt = new Date();
    await targetUser.save();

    // Invalidate all sessions
    await this.sessionService.invalidateAllSessions(new Types.ObjectId(id));

    this.logger.log(`User ${id} deleted by ${actorId}`);
  }

  /**
   * Map user document to admin DTO.
   */
  private mapToAdminUserDto(user: UserDocument): AdminUserDto {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      authProvider: user.authProvider,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      googleId: user.googleId,
      facebookId: user.facebookId,
    };
  }
}
