import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from '../services/oauth.service';

/**
 * OAuth Callback DTO
 * Used to handle OAuth callback requests
 */
export class OAuthCallbackDto {
  @ApiProperty({
    description: 'OAuth provider name',
    enum: ['google', 'facebook', 'github'],
    example: 'google',
  })
  @IsEnum(['google', 'facebook', 'github'], {
    message: 'Provider must be google, facebook, or github',
  })
  @IsNotEmpty()
  provider!: OAuthProvider;

  @ApiProperty({
    description: 'OAuth authorization code from provider',
    example: '4/0AX4XhW7ly5Cx...',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'OAuth state parameter for CSRF protection',
    example: 'random_state_string',
    required: false,
  })
  @IsString()
  state?: string;
}

/**
 * OAuth Authorization URL Response DTO
 */
export class OAuthAuthUrlResponseDto {
  @ApiProperty({
    description: 'OAuth authorization URL',
    example: 'https://accounts.google.com/o/oauth2/v2/auth?...',
  })
  url!: string;

  @ApiProperty({
    description: 'OAuth provider name',
    example: 'google',
  })
  provider!: string;
}

/**
 * OAuth Authorization URL Request DTO
 */
export class OAuthAuthUrlDto {
  @ApiProperty({
    description: 'OAuth provider name',
    enum: ['google', 'facebook', 'github'],
    example: 'google',
  })
  @IsEnum(['google', 'facebook', 'github'], {
    message: 'Provider must be google, facebook, or github',
  })
  @IsNotEmpty()
  provider!: OAuthProvider;
}
