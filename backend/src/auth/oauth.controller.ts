import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { OAuthService } from './services/oauth.service';
import { OAuthCallbackDto, OAuthAuthUrlDto } from './dto/oauth-callback.dto';
import { Public } from './decorators/public.decorator';
import { ApiResponse } from '../common/dto/api-response.dto';

/**
 * OAuth Controller
 * Handles OAuth authentication endpoints
 */
@ApiTags('oauth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Get authorization URL for OAuth provider
   * GET /api/auth/oauth/authorize?provider=google
   */
  @Public()
  @Get('authorize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get OAuth authorization URL',
    description:
      'Returns the OAuth authorization URL for the specified provider (Google, Facebook). ' +
      'User will be redirected to this URL to authenticate with the OAuth provider.',
  })
  @ApiQuery({
    name: 'provider',
    required: true,
    description: 'OAuth provider name (google, facebook)',
    enum: ['google', 'facebook'],
    example: 'google',
  })
  getAuthorizationUrl(
    @Query() query: OAuthAuthUrlDto,
  ): ApiResponse<{ url: string; provider: string }> {
    const url = this.oauthService.getAuthorizationUrl(query.provider);
    return ApiResponse.success({
      url,
      provider: query.provider,
    });
  }

  /**
   * Handle OAuth callback
   * POST /api/auth/oauth/callback
   */
  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle OAuth callback',
    description:
      'Processes the OAuth callback from the provider after user authentication. ' +
      'Exchanges the authorization code for access tokens and creates/updates user account.',
  })
  @ApiBody({ type: OAuthCallbackDto })
  async handleCallback(
    @Body() dto: OAuthCallbackDto,
    @Res() response: Response,
  ) {
    const result = await this.oauthService.handleCallback(
      dto.provider,
      dto.code,
      dto.state || '',
      response,
    );
    return response.status(HttpStatus.OK).json(result);
  }

  /**
   * Get list of supported OAuth providers
   * GET /api/auth/oauth/providers
   */
  @Public()
  @Get('providers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get supported OAuth providers',
    description:
      'Returns a list of all supported OAuth providers for authentication.',
  })
  getProviders(): ApiResponse<{ providers: string[] }> {
    const providers = this.oauthService.getSupportedProviders();
    return ApiResponse.success({ providers });
  }
}
