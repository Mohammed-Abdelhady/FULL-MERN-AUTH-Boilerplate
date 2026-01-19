import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { AuthProvider } from '../enums/auth-provider.enum';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { OAuthUserProfile } from '../../auth/strategies/oauth.strategy.interface';

/**
 * Account Linking Service
 *
 * Manages linking/unlinking multiple OAuth providers to a single user account.
 * Provides validation to ensure:
 * - No duplicate provider links
 * - No email conflicts
 * - At least one auth method remains
 * - Provider IDs are unique across users
 */
@Injectable()
export class AccountLinkingService {
  private readonly logger = new Logger(AccountLinkingService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Link an OAuth provider to an existing user account
   *
   * @param userId - User ID to link provider to
   * @param provider - OAuth provider (google, facebook, github)
   * @param profile - OAuth user profile from provider
   * @returns Updated user document
   * @throws AppException if validation fails
   */
  async linkProvider(
    userId: string,
    provider: AuthProvider,
    profile: OAuthUserProfile,
  ): Promise<User> {
    // Get user
    const user = await this.userModel.findById(userId).exec();
    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // VALIDATION 1: Check provider not already linked to THIS user
    if (user.linkedProviders.includes(provider)) {
      throw new AppException(
        ErrorCode.PROVIDER_ALREADY_LINKED,
        `${provider} is already linked to your account`,
        HttpStatus.CONFLICT,
      );
    }

    // VALIDATION 2: Check provider ID not linked to OTHER user
    const providerIdField = this.getProviderIdField(provider);
    const existingUser = await this.userModel
      .findOne({
        [providerIdField]: profile.providerId,
        _id: { $ne: userId },
      })
      .exec();

    if (existingUser) {
      throw new AppException(
        ErrorCode.PROVIDER_LINKED_TO_OTHER_ACCOUNT,
        `This ${provider} account is already linked to another user`,
        HttpStatus.CONFLICT,
      );
    }

    // VALIDATION 3: Email match
    if (profile.email && profile.email !== user.email) {
      this.logger.warn(
        `Email mismatch when linking ${provider}: user=${user.email}, provider=${profile.email}`,
      );
      throw new AppException(
        ErrorCode.EMAIL_MISMATCH_ON_LINK,
        `Email from ${provider} (${profile.email}) does not match your account email (${user.email})`,
        HttpStatus.CONFLICT,
      );
    }

    // LINK PROVIDER
    user.linkedProviders.push(provider);
    // Dynamic property access requires type assertion
    (user as unknown as Record<string, unknown>)[providerIdField] =
      profile.providerId;

    // If first linked provider (besides email), set as primary
    if (!user.primaryProvider && provider !== AuthProvider.EMAIL) {
      user.primaryProvider = provider;
    }

    await user.save();

    this.logger.log(`User ${userId} linked ${provider} account successfully`);

    return user;
  }

  /**
   * Unlink an OAuth provider from a user account
   *
   * @param userId - User ID to unlink provider from
   * @param provider - OAuth provider to unlink
   * @returns Updated user document
   * @throws AppException if validation fails
   */
  async unlinkProvider(userId: string, provider: AuthProvider): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // VALIDATION 1: Check provider is linked
    if (!user.linkedProviders.includes(provider)) {
      throw new AppException(
        ErrorCode.PROVIDER_NOT_LINKED,
        `${provider} is not linked to your account`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // VALIDATION 2: Cannot unlink last auth method
    if (user.linkedProviders.length === 1) {
      throw new AppException(
        ErrorCode.CANNOT_UNLINK_LAST_PROVIDER,
        'You must have at least one authentication method',
        HttpStatus.BAD_REQUEST,
      );
    }

    // UNLINK PROVIDER
    user.linkedProviders = user.linkedProviders.filter(
      (p) => (p as AuthProvider) !== provider,
    );

    // Clear provider ID field
    const providerIdField = this.getProviderIdField(provider);
    // Dynamic property access requires type assertion
    (user as unknown as Record<string, unknown>)[providerIdField] = undefined;

    // If unlinking primary, set new primary to first remaining provider
    if (user.primaryProvider === provider) {
      user.primaryProvider = user.linkedProviders[0] as AuthProvider;
    }

    await user.save();

    this.logger.log(`User ${userId} unlinked ${provider} account successfully`);

    return user;
  }

  /**
   * Get all linked providers for a user
   *
   * @param userId - User ID
   * @returns Array of linked providers
   */
  async getLinkedProviders(userId: string): Promise<AuthProvider[]> {
    const user = await this.userModel
      .findById(userId)
      .select('linkedProviders')
      .exec();

    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return user.linkedProviders as AuthProvider[];
  }

  /**
   * Check if a provider can be unlinked (at least one other auth method exists)
   *
   * @param userId - User ID
   * @param provider - Provider to check
   * @returns True if provider can be unlinked
   */
  async canUnlinkProvider(
    userId: string,
    provider: AuthProvider,
  ): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('linkedProviders')
      .exec();

    if (!user || user.isDeleted) {
      return false;
    }

    // Can unlink if more than one provider is linked
    return (
      user.linkedProviders.includes(provider) && user.linkedProviders.length > 1
    );
  }

  /**
   * Check if a provider is the primary provider
   *
   * @param userId - User ID
   * @param provider - Provider to check
   * @returns True if provider is primary
   */
  async isPrimaryProvider(
    userId: string,
    provider: AuthProvider,
  ): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('primaryProvider')
      .exec();

    if (!user || user.isDeleted) {
      return false;
    }

    return user.primaryProvider === provider;
  }

  /**
   * Set a provider as the primary provider for profile syncing
   *
   * @param userId - User ID
   * @param provider - Provider to set as primary
   * @returns Updated user document
   * @throws AppException if provider is not linked
   */
  async setPrimaryProvider(
    userId: string,
    provider: AuthProvider,
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user || user.isDeleted) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Validate provider is linked
    if (!user.linkedProviders.includes(provider)) {
      throw new AppException(
        ErrorCode.PROVIDER_NOT_LINKED,
        `${provider} is not linked to your account`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // EMAIL provider cannot be primary (no profile to sync)
    if (provider === AuthProvider.EMAIL) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'Email provider cannot be set as primary for profile syncing',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.primaryProvider = provider;
    await user.save();

    this.logger.log(`User ${userId} set ${provider} as primary provider`);

    return user;
  }

  /**
   * Get the provider ID field name for a given provider
   *
   * @param provider - OAuth provider
   * @returns Field name (e.g., 'googleId', 'githubId')
   */
  private getProviderIdField(provider: AuthProvider): string {
    const fieldMap: Record<string, string> = {
      [AuthProvider.GOOGLE]: 'googleId',
      [AuthProvider.FACEBOOK]: 'facebookId',
      [AuthProvider.GITHUB]: 'githubId',
    };

    const field = fieldMap[provider];
    if (!field) {
      throw new AppException(
        ErrorCode.INVALID_OAUTH_PROVIDER,
        `Invalid OAuth provider: ${provider}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return field;
  }
}
