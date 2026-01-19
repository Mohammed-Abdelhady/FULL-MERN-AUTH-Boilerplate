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
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard, RequestWithUser } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfileDto, SessionListData } from './dto/user-profile.dto';
import {
  LinkProviderDto,
  SetPrimaryProviderDto,
  LinkedProvidersResponseDto,
} from './dto/account-linking.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { AccountLinkingService } from './services/account-linking.service';
import { ProfileSyncService } from './services/profile-sync.service';
import { OAuthService, OAuthProvider } from '../auth/services/oauth.service';
import { AuthProvider } from './enums/auth-provider.enum';

/**
 * User controller for self-service operations.
 * All endpoints require authentication.
 */
@ApiTags('user')
@ApiBearerAuth('JWT-auth')
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly accountLinkingService: AccountLinkingService,
    private readonly oauthService: OAuthService,
    private readonly profileSyncService: ProfileSyncService,
  ) {}

  /**
   * Get current user's profile.
   *
   * @example GET /user/profile
   */
  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile information of the authenticated user.',
  })
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
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates the profile information of the authenticated user.',
  })
  @ApiBody({ type: UpdateProfileDto })
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
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Changes the user password. Requires current password for verification. ' +
      'Invalidates all other sessions after successful password change.',
  })
  @ApiBody({ type: ChangePasswordDto })
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
  @ApiOperation({
    summary: 'Get user sessions',
    description:
      'Returns a list of all active sessions for the authenticated user, ' +
      'including the current session.',
  })
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
  @ApiOperation({
    summary: 'Revoke a session',
    description:
      'Revokes a specific session by ID. Cannot revoke the current session.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID to revoke',
    example: '507f1f77bcf86cd799439011',
  })
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
  @ApiOperation({
    summary: 'Revoke all other sessions',
    description:
      'Revokes all sessions except the current one. Useful for security after password change.',
  })
  async revokeAllOtherSessions(
    @CurrentUser('id') userId: string,
    @Req() request: RequestWithUser,
  ): Promise<ApiResponse<{ revokedCount: number }>> {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sid';
    const currentSessionToken = request.cookies?.[cookieName] as string;
    return this.userService.revokeAllOtherSessions(userId, currentSessionToken);
  }

  /**
   * Get all linked providers for current user.
   *
   * @example GET /user/linked-providers
   */
  @Get('linked-providers')
  @ApiOperation({
    summary: 'Get linked providers',
    description:
      'Returns a list of all OAuth providers linked to the authenticated user account.',
  })
  async getLinkedProviders(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<LinkedProvidersResponseDto>> {
    const providers =
      await this.accountLinkingService.getLinkedProviders(userId);

    // Get user to find primary provider
    const user = await this.userService['userModel']
      .findById(userId)
      .select('primaryProvider')
      .exec();

    return ApiResponse.success({
      providers: providers as string[],
      primaryProvider: user?.primaryProvider,
    });
  }

  /**
   * Link a new OAuth provider to current user's account.
   *
   * @example POST /user/link-provider
   */
  @Post('link-provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Link OAuth provider',
    description:
      'Links a new OAuth provider (Google, Facebook, GitHub) to the authenticated user account. ' +
      'The email from the OAuth provider must match the user account email.',
  })
  @ApiBody({ type: LinkProviderDto })
  async linkProvider(
    @CurrentUser('id') userId: string,
    @Body() dto: LinkProviderDto,
  ): Promise<ApiResponse<UserProfileDto>> {
    // Get OAuth user profile using the provider code
    // AuthProvider and OAuthProvider use same lowercase values for OAuth providers
    const profile = await this.oauthService.getUserProfile(
      dto.provider.toLowerCase() as OAuthProvider,
      dto.code,
      dto.state,
    );

    // Link the provider to user account
    await this.accountLinkingService.linkProvider(
      userId,
      dto.provider,
      profile,
    );

    // Return updated user profile
    return this.userService.getProfile(userId);
  }

  /**
   * Unlink an OAuth provider from current user's account.
   *
   * @example DELETE /user/unlink-provider/:provider
   */
  @Delete('unlink-provider/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unlink OAuth provider',
    description:
      'Unlinks an OAuth provider from the authenticated user account. ' +
      'Cannot unlink the last authentication method.',
  })
  @ApiParam({
    name: 'provider',
    description: 'OAuth provider to unlink',
    enum: ['GOOGLE', 'FACEBOOK', 'GITHUB'],
    example: 'GITHUB',
  })
  async unlinkProvider(
    @CurrentUser('id') userId: string,
    @Param('provider') provider: string,
  ): Promise<ApiResponse<UserProfileDto>> {
    // Convert string to AuthProvider enum (provider comes as uppercase from route)
    const authProvider = provider.toLowerCase() as AuthProvider;

    // Unlink the provider
    await this.accountLinkingService.unlinkProvider(userId, authProvider);

    // Return updated user profile
    return this.userService.getProfile(userId);
  }

  /**
   * Set primary provider for profile synchronization.
   *
   * @example POST /user/set-primary-provider
   */
  @Post('set-primary-provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set primary provider',
    description:
      'Sets an OAuth provider as the primary provider for automatic profile synchronization. ' +
      'The provider must already be linked to the account.',
  })
  @ApiBody({ type: SetPrimaryProviderDto })
  async setPrimaryProvider(
    @CurrentUser('id') userId: string,
    @Body() dto: SetPrimaryProviderDto,
  ): Promise<ApiResponse<UserProfileDto>> {
    // Set primary provider
    await this.accountLinkingService.setPrimaryProvider(userId, dto.provider);

    // Return updated user profile
    return this.userService.getProfile(userId);
  }

  /**
   * Get profile sync status for current user.
   *
   * @example GET /user/sync-status
   */
  @Get('sync-status')
  @ApiOperation({
    summary: 'Get profile sync status',
    description:
      'Returns profile synchronization status including last sync timestamp and primary provider.',
  })
  async getSyncStatus(@CurrentUser('id') userId: string): Promise<
    ApiResponse<{
      lastSyncedAt?: Date;
      lastSyncedProvider?: string;
      primaryProvider?: AuthProvider;
      canSync: boolean;
    }>
  > {
    const status = await this.profileSyncService.getSyncStatus(userId);
    return ApiResponse.success(status);
  }

  /**
   * Initiate manual profile sync from primary provider.
   * Requires user to re-authenticate with OAuth.
   *
   * @example POST /user/sync-profile
   */
  @Post('sync-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initiate profile sync',
    description:
      'Initiates manual profile synchronization from the primary OAuth provider. ' +
      'Returns instructions to re-authenticate with OAuth for fresh profile data.',
  })
  async initiateProfileSync(@CurrentUser('id') userId: string): Promise<
    ApiResponse<{
      requiresOAuth: boolean;
      provider: AuthProvider;
      message: string;
    }>
  > {
    const syncInstructions =
      await this.profileSyncService.initiateManualSync(userId);
    return ApiResponse.success(syncInstructions);
  }

  /**
   * Deactivate (soft delete) current user's account.
   *
   * @example DELETE /user/account
   */
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate user account',
    description:
      'Permanently deactivates the authenticated user account. This action cannot be undone.',
  })
  async deactivateAccount(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.userService.deactivateAccount(userId);
  }
}
