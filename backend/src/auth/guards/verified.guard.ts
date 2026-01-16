import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RequestWithUser } from './auth.guard';

@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new ForbiddenException('Authentication required');
    }

    if (!request.user.isVerified) {
      throw new ForbiddenException(
        'Email verification required. Please verify your email to access this resource.',
      );
    }

    return true;
  }
}
