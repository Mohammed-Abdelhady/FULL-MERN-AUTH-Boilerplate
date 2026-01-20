import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { WILDCARD_PERMISSION } from '../../common/constants/permissions';
import { AddPermissionsToUsersMigration } from './add-permissions-to-users.migration';

/**
 * Migration controller for running database migrations.
 * All endpoints require wildcard permission (admin only).
 */
@ApiTags('migrations')
@ApiBearerAuth('JWT-auth')
@Controller('migrations')
@UseGuards(AuthGuard, PermissionGuard)
export class MigrationController {
  constructor(
    private readonly addPermissionsMigration: AddPermissionsToUsersMigration,
  ) {}

  /**
   * Run migration to add permissions to users based on their roles.
   * Only users with wildcard permission (*) can run migrations.
   */
  @Post('add-permissions-to-users')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(WILDCARD_PERMISSION)
  @ApiOperation({
    summary: 'Migrate user permissions',
    description:
      'Adds default permissions to users based on their roles. ' +
      'Users who already have permissions will be skipped. ' +
      'This migration should be run once after deploying the RBAC system.',
  })
  async addPermissionsToUsers(): Promise<{
    success: boolean;
    usersProcessed: number;
    usersUpdated: number;
    usersSkipped: number;
    errors: string[];
  }> {
    return this.addPermissionsMigration.migrate();
  }

  /**
   * Rollback migration (remove all permissions from users).
   * WARNING: This will remove ALL permissions from ALL users.
   */
  @Post('rollback-permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(WILDCARD_PERMISSION)
  @ApiOperation({
    summary: 'Rollback permission migration',
    description:
      'WARNING: Removes ALL permissions from ALL users. Use with caution.',
  })
  async rollbackPermissions(): Promise<{
    success: boolean;
    usersProcessed: number;
  }> {
    return this.addPermissionsMigration.rollback();
  }
}
