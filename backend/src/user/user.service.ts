import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
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
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Get current user profile.
   */
  async getProfile(userId: string): Promise<ApiResponse<UserProfileDto>> {
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
    return ApiResponse.success(this.mapToProfileDto(user));
  }

  /**
   * Update current user profile.
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<UserProfileDto>> {
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
    return ApiResponse.success(
      this.mapToProfileDto(user),
      'Profile updated successfully',
    );
  }

  /**
   * Change user password.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    currentSessionToken: string,
  ): Promise<ApiResponse<{ message: string }>> {
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
      createdAt: (session as unknown as { createdAt: Date }).createdAt,
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
   * Map user document to profile DTO.
   */
  private mapToProfileDto(user: UserDocument): UserProfileDto {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      authProvider: user.authProvider,
      isVerified: user.isVerified,
      googleId: user.googleId,
      facebookId: user.facebookId,
    };
  }
}
