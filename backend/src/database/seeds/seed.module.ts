import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserSchema } from '../../user/schemas/user.schema';
import { SeedService } from './seed.service';

/**
 * Seed Module
 *
 * This module provides database seeding functionality.
 * It imports the UserModule to access the UserModel and provides
 * the SeedService for seeding operations.
 */
@Module({
  imports: [
    ConfigModule,
    // Import User model for seeding operations
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
