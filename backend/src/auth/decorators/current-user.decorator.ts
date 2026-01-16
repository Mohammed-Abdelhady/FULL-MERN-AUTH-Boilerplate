import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../guards/auth.guard';

/**
 * Extract current user from request
 * Usage:
 *   @CurrentUser() user - Get full user object
 *   @CurrentUser('id') userId - Get specific property
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data as keyof typeof user] : user;
  },
);
