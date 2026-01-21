import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationController } from './migration.controller';
import { AddPermissionsToUsersMigration } from './add-permissions-to-users.migration';
import { User, UserSchema } from '../../user/schemas/user.schema';
import { Role, RoleSchema } from '../../role/schemas/role.schema';
import { AuthModule } from '../../auth/auth.module';
import { CommonModule } from '../../common/common.module';

/**
 * Migration module for running database migrations.
 * Provides endpoints for admin users to run migrations manually.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    AuthModule,
    CommonModule,
  ],
  controllers: [MigrationController],
  providers: [AddPermissionsToUsersMigration],
  exports: [AddPermissionsToUsersMigration],
})
export class MigrationModule {}
