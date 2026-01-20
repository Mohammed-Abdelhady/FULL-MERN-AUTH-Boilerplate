import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { DEFAULT_ROLE_PERMISSIONS } from '../../common/constants/permissions';

/**
 * Migration script to add permissions to existing users based on their roles.
 * This should be run once after deploying the RBAC system.
 *
 * Usage:
 * 1. Import this service in a module
 * 2. Inject it in a controller or service
 * 3. Call the migrate() method via an endpoint or command
 *
 * @example
 * // In a controller:
 * @Post('migrate/add-permissions')
 * async runMigration() {
 *   return await this.migrationService.migrate();
 * }
 */
@Injectable()
export class AddPermissionsToUsersMigration {
  private readonly logger = new Logger(AddPermissionsToUsersMigration.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Run the migration to add permissions to users based on their roles.
   * Users who already have permissions will be skipped.
   *
   * @returns Migration summary
   */
  async migrate(): Promise<{
    success: boolean;
    usersProcessed: number;
    usersUpdated: number;
    usersSkipped: number;
    errors: string[];
  }> {
    this.logger.log('Starting migration: Add permissions to users');

    const errors: string[] = [];
    let usersProcessed = 0;
    let usersUpdated = 0;
    let usersSkipped = 0;

    try {
      // Find all users without permissions array or with empty permissions
      const users = await this.userModel.find({
        $or: [
          { permissions: { $exists: false } },
          { permissions: { $size: 0 } },
        ],
      });

      this.logger.log(`Found ${users.length} users to process`);

      for (const user of users) {
        usersProcessed++;

        try {
          // Get default permissions for user's role
          const roleSlug = user.role.toLowerCase();
          const defaultPermissions =
            DEFAULT_ROLE_PERMISSIONS[
              roleSlug as keyof typeof DEFAULT_ROLE_PERMISSIONS
            ];

          if (!defaultPermissions) {
            // Custom role or unknown role - skip
            this.logger.warn(
              `Unknown role "${user.role}" for user ${user.email}. Skipping.`,
            );
            usersSkipped++;
            continue;
          }

          // Update user with default permissions
          user.permissions = [...defaultPermissions];
          await user.save();

          this.logger.log(
            `Updated user ${user.email} with ${user.permissions.length} permissions`,
          );
          usersUpdated++;
        } catch (error) {
          const errorMsg = `Failed to update user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      const summary = {
        success: errors.length === 0,
        usersProcessed,
        usersUpdated,
        usersSkipped,
        errors,
      };

      this.logger.log('Migration completed:', summary);

      return summary;
    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMsg);
      errors.push(errorMsg);

      return {
        success: false,
        usersProcessed,
        usersUpdated,
        usersSkipped,
        errors,
      };
    }
  }

  /**
   * Rollback the migration by removing permissions from all users.
   * WARNING: This will remove ALL permissions from ALL users.
   *
   * @returns Rollback summary
   */
  async rollback(): Promise<{
    success: boolean;
    usersProcessed: number;
  }> {
    this.logger.warn('Starting rollback: Remove all permissions from users');

    try {
      const result = await this.userModel.updateMany(
        {},
        { $set: { permissions: [] } },
      );

      const summary = {
        success: true,
        usersProcessed: result.modifiedCount,
      };

      this.logger.log('Rollback completed:', summary);

      return summary;
    } catch (error) {
      this.logger.error(
        `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return {
        success: false,
        usersProcessed: 0,
      };
    }
  }
}
