# Postman Collection

This directory contains a comprehensive Postman collection for the FULL-MERN-AUTH-Boilerplate API.

## 📁 Files

- `FULL-MERN-AUTH-Boilerplate-API.postman_collection.json` - Main Postman collection with all API endpoints
- `dev.json` - Development environment configuration
- `staging.json` - Staging environment configuration
- `production.json` - Production environment configuration

## 🚀 Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** in the top left corner
3. Select **Upload Files**
4. Choose `FULL-MERN-AUTH-Boilerplate-API.postman_collection.json`
5. Click **Import**

### 2. Import the Environment

1. In Postman, click the **gear icon** (Settings) → **Manage Environments**
2. Click **Import**
3. Choose the appropriate environment file:
   - `dev.json` for local development
   - `staging.json` for staging server
   - `production.json` for production server
4. Click **Import**

### 3. Set Active Environment

1. Click the environment dropdown in the top right corner
2. Select the environment you just imported (e.g., **Development**)

## 📚 Collection Structure

The collection is organized into the following folders:

### Authentication

- **Register User** - Create a new user account
- **Activate Account** - Activate account with email and code
- **Login** - Authenticate with email and password
- **Logout** - Invalidate current session

### OAuth

- **Get Authorization URL** - Get OAuth authorization URL for provider
- **Handle OAuth Callback** - Process OAuth callback from provider
- **Get Supported Providers** - List available OAuth providers

### User

- **Get Profile** - Get current user profile
- **Update Profile** - Update user profile information
- **Change Password** - Change user password
- **Get Sessions** - List all active sessions
- **Revoke Session** - Revoke a specific session
- **Revoke All Other Sessions** - Revoke all sessions except current
- **Deactivate Account** - Permanently deactivate account

### Admin

- **List Users** - Paginated list of users with filtering
- **Get User by ID** - Get detailed user information
- **Update User Status** - Activate/deactivate user account
- **Update User Role** - Change user role (MANAGER, SUPPORT, USER)
- **Delete User** - Soft delete user account

### Health

- **Health Check** - Check API health status

## 🔐 Authentication Flow

The collection includes automatic authentication handling:

1. **Public Endpoints**: Authentication endpoints (`/auth/register`, `/auth/activate`, `/auth/login`, `/auth/oauth/*`, `/health`) do not require authentication
2. **Protected Endpoints**: User and Admin endpoints require JWT authentication
3. **Automatic Token Handling**: After successful login, the JWT token is automatically stored in the `jwtToken` variable
4. **Pre-request Script**: Automatically adds `Authorization: Bearer {{jwtToken}}` header to protected requests

### 📝 Environment Variables

| Variable       | Description                          | Example Value               |
| -------------- | ------------------------------------ | --------------------------- |
| `baseUrl`      | API base URL                         | `http://localhost:3000/api` |
| `jwtToken`     | JWT authentication token             | (auto-set after login)      |
| `testEmail`    | Test user email                      | `test@example.com`          |
| `testPassword` | Test user password                   | `Password123`               |
| `testName`     | Test user name                       | `Test User`                 |
| `userId`       | User ID (auto-set from responses)    | (auto-set)                  |
| `sessionId`    | Session ID (auto-set from responses) | (auto-set)                  |

## 🧪 Running the Collection

### Complete Authentication Flow

1. **Register User**
   - Run `Authentication → Register User`
   - Check that status is 200 and `success: true`
   - Note: The `userId` variable will be automatically set

2. **Activate Account**
   - Run `Authentication → Activate Account`
   - Use the email from registration and the activation code sent to email
   - Check that status is 200 and `success: true`

3. **Login**
   - Run `Authentication → Login`
   - Use the registered email and password
   - Check that status is 200 and `success: true`
   - Note: The `jwtToken` and `userId` variables will be automatically set

4. **Access Protected Endpoints**
   - Now you can access User or Admin endpoints
   - The `Authorization` header is automatically added

5. **Logout**
   - Run `Authentication → Logout` when done
   - This clears the session on the server

### OAuth Authentication Flow

1. **Get Authorization URL**
   - Run `OAuth → Get Authorization URL`
   - Copy the URL from response
   - Open the URL in a browser to authorize with OAuth provider

2. **Handle Callback**
   - After OAuth provider redirects back, run `OAuth → Handle OAuth Callback`
   - The JWT token will be automatically stored

3. **Access Protected Endpoints**
   - Use the token to access User endpoints

## 🧪 Test Scripts

Each request includes automated test scripts that verify:

- **Status Code**: Verifies the HTTP status code matches expected values
- **Success Flag**: Checks that `success` is `true` for successful responses
- **Data Existence**: Validates that the `data` field exists in responses
- **Token Storage**: Automatically stores JWT tokens for authenticated requests
- **User ID Storage**: Automatically stores user IDs from responses

## 🔧 Troubleshooting

### Authentication Issues

**Problem**: Getting 401 Unauthorized errors

**Solutions**:

1. Ensure you've successfully logged in first
2. Check that the `jwtToken` variable is set (visible in environment sidebar)
3. Try logging in again to refresh the token
4. Verify the `baseUrl` variable matches your server URL

### CORS Issues

**Problem**: Getting CORS errors

**Solutions**:

1. Ensure the backend server is running
2. Check that the `CLIENT_URL` environment variable in backend matches your frontend URL
3. Verify CORS is properly configured in `backend/src/main.ts`

### Session Issues

**Problem**: Session not being stored or retrieved

**Solutions**:

1. Check that cookies are enabled in your browser
2. Verify the `SESSION_COOKIE_NAME` environment variable is set
3. Check browser console for cookie-related errors

### Data Validation Errors

**Problem**: Getting 400 Bad Request errors

**Solutions**:

1. Check request body matches the expected format
2. Verify all required fields are included
3. Ensure data types are correct (strings, numbers, booleans)
4. Check validation rules (password complexity, email format)

## 📖 Additional Resources

- [Swagger Documentation](http://localhost:3000/api/docs) - Interactive API documentation
- [OpenAPI Specification](http://localhost:3000/api/docs-json) - Machine-readable API spec
- [Backend README](../../README.md) - Backend documentation and setup instructions
- [API Responses Documentation](../api-responses.md) - Detailed API response documentation

## 🔄 Updating the Collection

When the API changes:

1. **Update Requests**: Modify request URLs, bodies, or headers as needed
2. **Update Tests**: Adjust test scripts to match new response formats
3. **Update Environments**: Add new environment variables if needed
4. **Version Control**: Commit changes to track collection updates

## 📌 Best Practices

1. **Use Environments**: Always use environment files for different environments (dev, staging, production)
2. **Run Tests**: Execute test scripts to verify responses before using endpoints in production
3. **Check Logs**: Monitor backend logs for issues during API testing
4. **Clean Variables**: Clear sensitive data (tokens, passwords) when sharing collection
5. **Document Changes**: Keep track of custom modifications to the collection

## ⚠️ Security Notes

1. **Never Commit Tokens**: Do not commit actual JWT tokens to version control
2. **Use Test Accounts**: Use dedicated test accounts, not production credentials
3. **Rotate Credentials**: Regularly update test account passwords
4. **Disable in Production**: Ensure Swagger is disabled in production environments
5. **Review Access**: Regularly review who has access to your API collections

## 🤝 Support

For issues or questions about the Postman collection:

1. Check the [Backend README](../../README.md) for API documentation
2. Review the [API Responses Documentation](../api-responses.md) for response formats
3. Check backend logs for detailed error messages
4. Verify your environment configuration matches your setup
