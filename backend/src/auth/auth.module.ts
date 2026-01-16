import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OAuthController } from './oauth.controller';
import {
  PendingRegistration,
  PendingRegistrationSchema,
} from './schemas/pending-registration.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { SessionService } from './services/session.service';
import { OAuthService } from './services/oauth.service';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';
import { CommonModule } from '../common/common.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { AuthGuard } from './guards/auth.guard';
import { VerifiedGuard } from './guards/verified.guard';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: PendingRegistration.name, schema: PendingRegistrationSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    // ThrottlerModule is already configured globally in AppModule
    CommonModule,
    MailModule,
    UserModule,
    SessionModule,
  ],
  controllers: [AuthController, OAuthController],
  providers: [
    AuthService,
    SessionService,
    OAuthService,
    GoogleOAuthStrategy,
    AuthGuard,
    VerifiedGuard,
  ],
  exports: [
    AuthService,
    SessionService,
    OAuthService,
    AuthGuard,
    VerifiedGuard,
  ],
})
export class AuthModule {}

/**
 * Decorators are exported directly from their source files:
 * - @Public() from './decorators/public.decorator'
 * - @CurrentUser() from './decorators/current-user.decorator'
 * - @Verified() from './decorators/verified.decorator'
 */
