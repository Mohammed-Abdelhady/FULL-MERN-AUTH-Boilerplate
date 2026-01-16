import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (no authentication required)
 * Routes marked with this decorator bypass the AuthGuard
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
