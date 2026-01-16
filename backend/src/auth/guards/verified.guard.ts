import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { RequestWithUser } from './auth.guard';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';

@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new AppException(
        ErrorCode.SESSION_REQUIRED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!request.user.isVerified) {
      throw new AppException(
        ErrorCode.EMAIL_NOT_VERIFIED,
        'Email verification required. Please verify your email to access this resource.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
