# OAuth Authentication

This document describes the OAuth authentication implementation for the application.

## Overview

The application supports OAuth 2.0 authentication through a scalable, provider-agnostic architecture. Currently, Google OAuth is implemented, with the ability to easily add additional providers (Facebook, GitHub, etc.).

## Architecture

### Core Components

1. **OAuth Strategy Interface** ([`oauth.strategy.interface.ts`](../src/auth/strategies/oauth.strategy.interface.ts))
   - Defines the contract for OAuth provider implementations
   - Standardizes user profile data across providers
   - Enables easy addition of new providers

2. **Base OAuth Strategy** ([`base-oauth.strategy.ts`](../src/auth/strategies/base-oauth.strategy.ts))
   - Provides common functionality for all OAuth providers
   - Handles HTTP requests to OAuth endpoints
   - Manages state generation and validation
   - Implements CSRF protection

3. **Google OAuth Strategy** ([`google-oauth.strategy.ts`](../src/auth/strategies/google-oauth.strategy.ts))
   - Implements Google OAuth 2.0 flow
   - Exchanges authorization codes for access tokens
   - Retrieves user profile information
   - Validates email verification status

4. **OAuth Service** ([`oauth.service.ts`](../src/auth/services/oauth.service.ts))
   - Manages OAuth provider strategies
   - Handles user authentication flow
   - Links OAuth accounts to existing users
   - Creates new users for first-time OAuth logins

5. **OAuth Controller** ([`oauth.controller.ts`](../src/auth/oauth.controller.ts))
   - Exposes OAuth endpoints
   - Handles authorization URL generation
   - Processes OAuth callbacks
   - Lists supported providers

## API Endpoints

### Get Authorization URL

**Endpoint:** `GET /api/auth/oauth/authorize?provider={provider}`

**Description:** Generates an authorization URL for the specified OAuth provider.

**Query Parameters:**

- `provider` (required): OAuth provider name (`google`, `facebook`)

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "provider": "google"
  },
  "message": "Success"
}
```

### Handle OAuth Callback

**Endpoint:** `POST /api/auth/oauth/callback`

**Description:** Processes the OAuth callback and authenticates the user.

**Request Body:**

```json
{
  "provider": "google",
  "code": "4/0AX4XfWj...",
  "state": "random-state-string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isVerified": true,
    "provider": "google"
  },
  "message": "Success"
}
```

**Note:** A session cookie is set automatically upon successful authentication.

### Get Supported Providers

**Endpoint:** `GET /api/auth/oauth/providers`

**Description:** Returns a list of supported OAuth providers.

**Response:**

```json
{
  "success": true,
  "data": {
    "providers": ["google"]
  },
  "message": "Success"
}
```

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Google OAuth
OAUTH_GOOGLE_CLIENT_ID=your-google-oauth-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
OAUTH_GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/google

# Facebook OAuth (optional)
# OAUTH_FACEBOOK_CLIENT_ID=your-facebook-oauth-client-id
# OAUTH_FACEBOOK_CLIENT_SECRET=your-facebook-oauth-client-secret
# OAUTH_FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/facebook
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Add your callback URL to **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/oauth/callback/google`
   - Production: `https://yourdomain.com/api/auth/oauth/callback/google`
7. Copy the **Client ID** and **Client Secret** to your `.env` file

## User Flow

### New User via OAuth

1. Frontend requests authorization URL from `/api/auth/oauth/authorize?provider=google`
2. User is redirected to Google's consent page
3. User grants permissions
4. Google redirects back to your callback URL with authorization code
5. Frontend sends code to `/api/auth/oauth/callback`
6. Backend exchanges code for access token
7. Backend retrieves user profile from Google
8. Backend creates new user with Google ID
9. Backend creates session and sets cookie
10. User is authenticated

### Existing User via OAuth

1. User logs in with OAuth (same flow as above)
2. Backend finds existing user by Google ID
3. Backend updates user info if needed
4. Backend creates session and sets cookie
5. User is authenticated

### Linking OAuth Account

1. User logs in with existing credentials
2. User initiates OAuth login
3. Backend finds existing user by email
4. Backend links Google ID to existing user
5. User can now use OAuth for future logins

## Security Features

### CSRF Protection

- State parameter is generated for each authorization request
- State is validated on callback
- Prevents cross-site request forgery attacks

### Email Verification

- Google OAuth users are automatically verified
- Email verification status is inherited from Google

### Session Management

- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- SameSite=strict prevents CSRF attacks
- Configurable cookie expiration

## Adding New OAuth Providers

To add a new OAuth provider:

1. Create a new strategy file (e.g., `facebook-oauth.strategy.ts`)
2. Extend `BaseOAuthStrategy`
3. Implement required methods:
   - `getScopes()`: Return OAuth scopes
   - `getAuthorizationUrl()`: Generate authorization URL
   - `getUserProfile()`: Exchange code for user profile
4. Add environment variables for the provider
5. Register the strategy in `OAuthService`
6. Add provider to `OAuthProvider` type
7. Update DTOs to include the new provider

Example:

```typescript
@Injectable()
export class FacebookOAuthStrategy extends BaseOAuthStrategy {
  constructor(configService: ConfigService) {
    super(configService, 'facebook');
  }

  protected getScopes(): string[] {
    return ['email', 'public_profile'];
  }

  getAuthorizationUrl(state?: string): string {
    // Generate Facebook authorization URL
  }

  async getUserProfile(
    code: string,
    state?: string,
  ): Promise<OAuthUserProfile> {
    // Exchange code for user profile
  }
}
```

## Testing

Unit tests are provided for:

- OAuth Service ([`oauth.service.spec.ts`](../src/auth/services/oauth.service.spec.ts))
- Google OAuth Strategy ([`google-oauth.strategy.spec.ts`](../src/auth/strategies/google-oauth.strategy.spec.ts))
- OAuth Controller ([`oauth.controller.spec.ts`](../src/auth/oauth.controller.spec.ts))

Run tests:

```bash
npm test -- oauth.service.spec.ts
npm test -- google-oauth.strategy.spec.ts
npm test -- oauth.controller.spec.ts
```

## Error Handling

The following error codes are used for OAuth operations:

- `INVALID_OAUTH_PROVIDER`: Provider is not supported
- `OAUTH_AUTHENTICATION_FAILED`: OAuth authentication failed
- `OAUTH_INVALID_CODE`: Authorization code is invalid or expired

All errors follow the standard API response format defined in [`api-responses.md`](./api-responses.md).
