import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard, RequestWithUser } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfileDto, SessionListData } from './dto/user-profile.dto';
import { ApiResponse } from '../common/dto/api-response.dto';

/**
 * User controller for self-service operations.
 * All endpoints require authentication.
 */
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current user's profile.
   *
   * @example GET /user/profile
   */
  @Get('profile')
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<UserProfileDto>> {
    return this.userService.getProfile(userId);
  }

  /**
   * Update current user's profile.
   *
   * @example PATCH /user/profile
   */
  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse<UserProfileDto>> {
    return this.userService.updateProfile(userId, dto);
  }

  /**
   * Change current user's password.
   * Requires current password verification.
   * Invalidates all other sessions.
   *
   * @example POST /user/password
   */
  @Post('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Req() request: RequestWithUser,
  ): Promise<ApiResponse<{ message: string }>> {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sid';
    const currentSessionToken = request.cookies?.[cookieName] as string;
    return this.userService.changePassword(userId, dto, currentSessionToken);
  }

  /**
   * Get all active sessions for current user.
   *
   * @example GET /user/sessions
   */
  @Get('sessions')
  async getSessions(
    @CurrentUser('id') userId: string,
    @Req() request: RequestWithUser,
  ): Promise<ApiResponse<SessionListData>> {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sid';
    const currentSessionToken = request.cookies?.[cookieName] as string;
    return this.userService.getSessions(userId, currentSessionToken);
  }

  /**
   * Revoke a specific session.
   *
   * @example DELETE /user/sessions/:sessionId
   */
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Req() request: RequestWithUser,
  ): Promise<ApiResponse<{ message: string }>> {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sid';
    const currentSessionToken = request.cookies?.[cookieName] as string;
    return this.userService.revokeSession(
      userId,
      sessionId,
      currentSessionToken,
    );
  }

  /**
   * Revoke all sessions except current.
   *
   * @example POST /user/sessions/revoke-others
   */
  @Post('sessions/revoke-others')
  @HttpCode(HttpStatus.OK)
  async revokeAllOtherSessions(
    @CurrentUser('id') userId: string,
    @Req() request: RequestWithUser,
  ): Promise<ApiResponse<{ revokedCount: number }>> {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sid';
    const currentSessionToken = request.cookies?.[cookieName] as string;
    return this.userService.revokeAllOtherSessions(userId, currentSessionToken);
  }

  /**
   * Deactivate (soft delete) current user's account.
   *
   * @example DELETE /user/account
   */
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.userService.deactivateAccount(userId);
  }
}
