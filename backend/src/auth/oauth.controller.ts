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
import { Response } from 'express';
import { OAuthService } from './services/oauth.service';
import { OAuthCallbackDto, OAuthAuthUrlDto } from './dto/oauth-callback.dto';
import { Public } from './decorators/public.decorator';
import { ApiResponse } from '../common/dto/api-response.dto';

/**
 * OAuth Controller
 * Handles OAuth authentication endpoints
 */
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
  getProviders(): ApiResponse<{ providers: string[] }> {
    const providers = this.oauthService.getSupportedProviders();
    return ApiResponse.success({ providers });
  }
}
