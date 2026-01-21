import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { SessionService } from '../auth/services/session.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  UserProfileDto,
  SessionDto,
  SessionListData,
} from './dto/user-profile.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCode } from '../common/enums/error-code.enum';
import { ApiResponse } from '../common/dto/api-response.dto';

/**
 * User service for self-service operations.
 * Provides profile management, password changes, and session management.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Get current user profile.
   */
  async getProfile(userId: string): Promise<ApiResponse<UserProfileDto>> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel
      .findById(userId)
      .select(
        '-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires',
      )
      .exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Profile retrieved for user: ${user.email}`);
    const profileDto = await this.mapToProfileDto(user);
    return ApiResponse.success(profileDto);
  }

  /**
   * Update current user profile.
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<UserProfileDto>> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel.findById(userId).exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Update only provided fields
    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    await user.save();

    this.logger.log(`Profile updated for user: ${user.email}`);
    const profileDto = await this.mapToProfileDto(user);
    return ApiResponse.success(profileDto, 'Profile updated successfully');
  }

  /**
   * Change user password.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    currentSessionToken: string,
  ): Promise<ApiResponse<{ message: string }>> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel
      .findById(userId)
      .select('+password')
      .exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      throw new AppException(
        ErrorCode.INVALID_CURRENT_PASSWORD,
        'Cannot change password for OAuth-only accounts',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppException(
        ErrorCode.INVALID_CURRENT_PASSWORD,
        'Current password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);

    if (isSamePassword) {
      throw new AppException(
        ErrorCode.SAME_PASSWORD,
        'New password must be different from current password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash and update password
    user.password = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await user.save();

    // Invalidate all other sessions (keep current session)
    await this.sessionService.invalidateAllSessionsExcept(
      new Types.ObjectId(userId),
      currentSessionToken,
    );

    this.logger.log(`Password changed for user: ${user.email}`);
    return ApiResponse.success({
      message:
        'Password changed successfully. Other sessions have been logged out.',
    });
  }

  /**
   * Get all active sessions for current user.
   */
  async getSessions(
    userId: string,
    currentSessionToken: string,
  ): Promise<ApiResponse<SessionListData>> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sessions = await this.sessionService.getUserSessions(
      new Types.ObjectId(userId),
    );

    // Get current session to mark it
    const currentSession =
      await this.sessionService.getSessionByToken(currentSessionToken);
    const currentSessionId = currentSession?._id?.toString();

    const sessionDtos: SessionDto[] = sessions.map((session) => ({
      id: session._id.toString(),
      userAgent: session.userAgent,
      ip: session.ip,
      deviceName: session.deviceName,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      isCurrent: session._id.toString() === currentSessionId,
    }));

    this.logger.log(
      `Retrieved ${sessions.length} sessions for user: ${userId}`,
    );
    return ApiResponse.success({
      sessions: sessionDtos,
      total: sessionDtos.length,
    });
  }

  /**
   * Revoke a specific session.
   */
  async revokeSession(
    userId: string,
    sessionId: string,
    currentSessionToken: string,
  ): Promise<ApiResponse<{ message: string }>> {
    // Validate ObjectId formats
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid session ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if trying to revoke current session
    const currentSession =
      await this.sessionService.getSessionByToken(currentSessionToken);

    if (currentSession && currentSession._id.toString() === sessionId) {
      throw new AppException(
        ErrorCode.CANNOT_REVOKE_CURRENT_SESSION,
        'Cannot revoke current session. Use logout instead.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Revoke the session
    const revoked = await this.sessionService.invalidateSessionById(
      sessionId,
      new Types.ObjectId(userId),
    );

    if (!revoked) {
      throw new AppException(
        ErrorCode.SESSION_NOT_FOUND,
        'Session not found or already revoked',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`Session ${sessionId} revoked for user: ${userId}`);
    return ApiResponse.success({ message: 'Session revoked successfully' });
  }

  /**
   * Revoke all sessions except current.
   */
  async revokeAllOtherSessions(
    userId: string,
    currentSessionToken: string,
  ): Promise<ApiResponse<{ revokedCount: number }>> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const revokedCount = await this.sessionService.invalidateAllSessionsExcept(
      new Types.ObjectId(userId),
      currentSessionToken,
    );

    this.logger.log(`Revoked ${revokedCount} sessions for user: ${userId}`);
    return ApiResponse.success({
      revokedCount,
    });
  }

  /**
   * Soft delete (deactivate) own account.
   */
  async deactivateAccount(
    userId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const user = await this.userModel.findById(userId).exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Soft delete
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // Invalidate all sessions
    await this.sessionService.invalidateAllSessions(new Types.ObjectId(userId));

    this.logger.log(`Account deactivated for user: ${user.email}`);
    return ApiResponse.success({
      message: 'Account deactivated successfully',
    });
  }

  /**
   * Get user permissions.
   */
  async getUserPermissions(
    userId: string,
  ): Promise<
    ApiResponse<{ userId: string; permissions: string[]; role: string }>
  > {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel
      .findById(userId)
      .select('permissions role')
      .exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return ApiResponse.success({
      userId: user._id.toString(),
      permissions: user.permissions || [],
      role: user.role,
    });
  }

  /**
   * Add permission to user.
   */
  async addPermission(
    userId: string,
    permission: string,
  ): Promise<ApiResponse<{ userId: string; permissions: string[] }>> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel.findById(userId).exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if permission already exists
    if (user.permissions.includes(permission)) {
      throw new AppException(
        ErrorCode.PERMISSION_ALREADY_EXISTS,
        'User already has this permission',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Add permission
    user.permissions.push(permission);
    await user.save();

    this.logger.log(`Permission ${permission} added to user: ${user.email}`);
    return ApiResponse.success(
      {
        userId: user._id.toString(),
        permissions: user.permissions,
      },
      'Permission added successfully',
    );
  }

  /**
   * Remove permission from user.
   */
  async removePermission(
    userId: string,
    permission: string,
  ): Promise<ApiResponse<{ userId: string; permissions: string[] }>> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppException(
        ErrorCode.INVALID_INPUT,
        'Invalid user ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userModel.findById(userId).exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if permission exists
    if (!user.permissions.includes(permission)) {
      throw new AppException(
        ErrorCode.PERMISSION_NOT_FOUND,
        'User does not have this permission',
        HttpStatus.NOT_FOUND,
      );
    }

    // Remove permission
    user.permissions = user.permissions.filter((p) => p !== permission);
    await user.save();

    this.logger.log(
      `Permission ${permission} removed from user: ${user.email}`,
    );
    return ApiResponse.success(
      {
        userId: user._id.toString(),
        permissions: user.permissions,
      },
      'Permission removed successfully',
    );
  }

  /**
   * Get effective permissions for a user (role permissions + direct permissions).
   * @param userId - User ID or user document
   * @returns Array of effective permissions (deduplicated)
   */
  async getEffectivePermissions(
    user: UserDocument | { role: string; permissions: string[] },
  ): Promise<string[]> {
    const rolePermissions: string[] = [];

    // Fetch role permissions
    if (user.role) {
      const role = await this.roleModel.findOne({ slug: user.role }).exec();
      if (role && role.permissions) {
        rolePermissions.push(...role.permissions);
      }
    }

    // Combine role permissions with direct user permissions
    const directPermissions = user.permissions || [];
    const allPermissions = [...rolePermissions, ...directPermissions];

    // Deduplicate permissions
    return [...new Set(allPermissions)];
  }

  /**
   * Map user document to profile DTO.
   */
  private async mapToProfileDto(user: UserDocument): Promise<UserProfileDto> {
    // Compute effective permissions (role + direct)
    const effectivePermissions = await this.getEffectivePermissions(user);

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: effectivePermissions,
      authProvider: user.authProvider,
      isVerified: user.isVerified,
      googleId: user.googleId,
      facebookId: user.facebookId,
      githubId: user.githubId,
      linkedProviders: user.linkedProviders,
      primaryProvider: user.primaryProvider,
      profileSyncedAt: user.profileSyncedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
