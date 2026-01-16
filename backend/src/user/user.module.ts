import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { SessionService } from '../auth/services/session.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, SessionService],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
