import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../services/session.service';
import { SessionDocument } from '../../session/schemas/session.schema';
import { UserDocument } from '../../user/schemas/user.schema';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
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
      throw new UnauthorizedException('Authentication required');
    }

    const session = await this.sessionService.validateSession(sessionToken);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach user and session to request for use in controllers
    const user = session.user as unknown as UserDocument;
    request.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
    };
    request.session = session;

    return true;
  }
}
