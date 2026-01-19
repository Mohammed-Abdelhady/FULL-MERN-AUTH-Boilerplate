import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '../enums/auth-provider.enum';

/**
 * DTO for linking an OAuth provider to existing account
 */
export class LinkProviderDto {
  @ApiProperty({
    description: 'OAuth provider to link',
    enum: ['GOOGLE', 'FACEBOOK', 'GITHUB'],
    example: 'GITHUB',
  })
  @IsEnum(AuthProvider)
  @IsNotEmpty()
  provider!: AuthProvider;

  @ApiProperty({
    description: 'Authorization code from OAuth provider',
    example: 'abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'State parameter for CSRF protection',
    example: 'random-state-token',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;
}

/**
 * DTO for unlinking an OAuth provider from account
 */
export class UnlinkProviderDto {
  @ApiProperty({
    description: 'OAuth provider to unlink',
    enum: ['GOOGLE', 'FACEBOOK', 'GITHUB'],
    example: 'GITHUB',
  })
  @IsEnum(AuthProvider)
  @IsNotEmpty()
  provider!: AuthProvider;
}

/**
 * DTO for setting primary provider for profile sync
 */
export class SetPrimaryProviderDto {
  @ApiProperty({
    description: 'OAuth provider to set as primary',
    enum: ['GOOGLE', 'FACEBOOK', 'GITHUB'],
    example: 'GOOGLE',
  })
  @IsEnum(AuthProvider)
  @IsNotEmpty()
  provider!: AuthProvider;
}

/**
 * Response DTO for linked providers
 */
export class LinkedProvidersResponseDto {
  @ApiProperty({
    description: 'List of linked authentication providers',
    example: ['LOCAL', 'GOOGLE', 'GITHUB'],
    type: [String],
  })
  providers!: string[];

  @ApiProperty({
    description: 'Primary provider for profile synchronization',
    enum: ['LOCAL', 'GOOGLE', 'FACEBOOK', 'GITHUB'],
    example: 'GOOGLE',
    required: false,
  })
  primaryProvider?: string;
}
