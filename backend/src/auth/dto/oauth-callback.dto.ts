import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { OAuthProvider } from '../services/oauth.service';

/**
 * OAuth Callback DTO
 * Used to handle OAuth callback requests
 */
export class OAuthCallbackDto {
  @IsEnum(['google', 'facebook', 'github'], {
    message: 'Provider must be google, facebook, or github',
  })
  @IsNotEmpty()
  provider!: OAuthProvider;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  state?: string;
}

/**
 * OAuth Authorization URL Response DTO
 */
export class OAuthAuthUrlResponseDto {
  url!: string;
  provider!: string;
}

/**
 * OAuth Authorization URL Request DTO
 */
export class OAuthAuthUrlDto {
  @IsEnum(['google', 'facebook', 'github'], {
    message: 'Provider must be google, facebook, or github',
  })
  @IsNotEmpty()
  provider!: OAuthProvider;
}
