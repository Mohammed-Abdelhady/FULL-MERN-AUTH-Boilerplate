import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { SessionService } from '../auth/services/session.service';

/**
 * Admin module for user management operations.
 * Provides endpoints for listing, viewing, updating, and deleting users.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, SessionService],
  exports: [AdminService],
})
export class AdminModule {}
