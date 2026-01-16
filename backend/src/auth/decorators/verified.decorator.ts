import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { VerifiedGuard } from '../guards/verified.guard';

/**
 * Combine AuthGuard and VerifiedGuard
 * Use this decorator to require both authentication AND email verification
 */
export const Verified = () => UseGuards(AuthGuard, VerifiedGuard);
