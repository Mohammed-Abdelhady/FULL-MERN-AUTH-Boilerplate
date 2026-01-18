import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedModule } from './seeds/seed.module';

/**
 * Database Module
 *
 * This module provides database configuration and seeding functionality.
 * It handles MongoDB connection and provides access to seed operations.
 */
@Module({
  imports: [
    // Mongoose module for MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    // Seed module for database seeding operations
    SeedModule,
  ],
  exports: [SeedModule],
})
export class DatabaseModule {}
