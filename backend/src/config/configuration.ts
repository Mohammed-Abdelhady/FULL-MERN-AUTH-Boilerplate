import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

/**
 * Environment configuration interface
 * Defines all required and optional environment variables for the application
 */
export interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;

  // Database
  MONGO_URI: string;

  // Client
  CLIENT_URL: string;

  // Rate Limiting
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;

  // Security (optional, will be added later)
  JWT_SECRET?: string;
  MAIL_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  FACEBOOK_APP_ID?: string;
}

/**
 * Environment configuration class with validation decorators
 * Uses class-validator to ensure environment variables are valid on startup
 */
export class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV: 'development' | 'production' | 'test' = 'development';

  @IsInt()
  @Min(1000)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  MONGO_URI: string = 'mongodb://localhost:27017/authboiler';

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  CLIENT_URL: string = 'http://localhost:3000';

  @IsInt()
  @Min(1)
  @Max(3600)
  THROTTLE_TTL: number = 60;

  @IsInt()
  @Min(1)
  @Max(1000)
  THROTTLE_LIMIT: number = 60;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  MAIL_KEY?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  FACEBOOK_APP_ID?: string;
}
