import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../services/session.service';
import { SessionDocument } from '../../session/schemas/session.schema';
import { UserDocument } from '../../user/schemas/user.schema';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    isVerified: boolean;
  };
  session?: SessionDocument;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sid';
    const sessionToken = request.cookies?.[cookieName] as string | undefined;

    if (!sessionToken) {
      throw new AppException(
        ErrorCode.SESSION_REQUIRED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const session = await this.sessionService.validateSession(sessionToken);

    if (!session) {
      throw new AppException(
        ErrorCode.SESSION_INVALID,
        'Invalid or expired session',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Attach user and session to request for use in controllers
    const user = session.user as unknown as UserDocument;
    request.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      isVerified: user.isVerified,
    };
    request.session = session;

    return true;
  }
}
