import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserDocument } from '../../user/schemas/user.schema';
import { AuthProvider } from '../../user/enums/auth-provider.enum';

import { SEED_USERS } from './user.seed';
import { RoleSeedService } from './role.seed';

/**
 * Seed Service
 *
 * This service handles database seeding operations.
 * It provides methods to seed users and other data for development/testing purposes.
 *
 * @remarks
 * - Seeding is blocked in production by default for safety
 * - All seed operations are idempotent (safe to run multiple times)
 * - Seed users use @seed.local domain for easy identification
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly roleSeedService: RoleSeedService,
  ) {}

  /**
   * Seed all data
   *
   * This method orchestrates all seeding operations.
   * It calls individual seed methods and returns a summary.
   *
   * @returns Summary of seeded records
   * @throws Error if running in production without force flag
   */
  async seedAll(): Promise<{
    roles: string;
    users: number;
    total: number;
  }> {
    this.logger.log('Starting database seeding...');

    // Check environment
    const nodeEnv = this.configService.get<string>(
      'server.nodeEnv',
      'development',
    );
    if (nodeEnv === 'production') {
      throw new Error(
        'Seeding is not allowed in production environment. ' +
          'If you really want to seed production data, use the --force flag.',
      );
    }

    // Seed roles first (users depend on roles)
    await this.roleSeedService.seed();

    // Seed users
    const usersCount = await this.seedUsers();

    const summary = {
      roles: 'seeded',
      users: usersCount,
      total: usersCount,
    };

    this.logger.log(`Database seeding completed: ${JSON.stringify(summary)}`);
    return summary;
  }

  /**
   * Seed users
   *
   * Creates seed users for each role (USER, SUPPORT, MANAGER, ADMIN).
   * Each user is checked for existence before creation to ensure idempotency.
   *
   * @returns Number of users created
   */
  async seedUsers(): Promise<number> {
    this.logger.log('Seeding users...');
    let createdCount = 0;

    for (const userData of SEED_USERS) {
      try {
        // Check if user already exists
        const existingUser = await this.userModel.findOne({
          email: userData.email,
        });

        if (existingUser) {
          this.logger.log(`User already exists: ${userData.email}`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
          userData.password,
          this.configService.get<number>('bcrypt.rounds', 10),
        );

        // Create user with explicit MongoDB ObjectId
        await this.userModel.create({
          _id: new Types.ObjectId(), // Explicitly generate MongoDB ObjectId
          ...userData,
          password: hashedPassword,
          isVerified: true, // All seed users are verified
          authProvider: AuthProvider.EMAIL,
          permissions: userData.permissions || [],
        });

        this.logger.log(
          `Created seed user: ${userData.email} (${userData.role})`,
        );
        createdCount++;
      } catch (error) {
        this.logger.error(
          `Failed to create seed user ${userData.email}: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue with next user even if one fails
      }
    }

    this.logger.log(`Seeding users completed: ${createdCount} users created`);
    return createdCount;
  }

  /**
   * Reset database
   *
   * Drops all collections and reseeds database.
   * This is a destructive operation and should be used with caution.
   *
   * @throws Error if running in production
   */
  async resetDatabase(): Promise<void> {
    this.logger.warn('Resetting database...');

    // Check environment
    const nodeEnv = this.configService.get<string>(
      'server.nodeEnv',
      'development',
    );
    if (nodeEnv === 'production') {
      throw new Error(
        'Database reset is not allowed in production environment.',
      );
    }

    // Drop all collections
    const collections = Object.values(this.userModel.db.collections);
    for (const collection of collections) {
      await collection.deleteMany({});
    }

    this.logger.warn('All collections cleared');

    // Reseed
    await this.seedAll();

    this.logger.warn('Database reset completed');
  }
}
