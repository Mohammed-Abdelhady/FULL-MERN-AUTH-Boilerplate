import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Session, SessionDocument } from '../../session/schemas/session.schema';
import { Types } from 'mongoose';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new session for a user
   * @param userId - The user's ObjectId
   * @param userAgent - The user's browser/user agent
   * @param ip - The user's IP address
   * @returns The generated session token
   */
  async createSession(
    userId: Types.ObjectId,
    userAgent: string,
    ip: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const cookieMaxAge = this.configService.get<number>(
      'session.cookieMaxAge',
      604800000,
    );

    const expiresAt = new Date(Date.now() + cookieMaxAge);

    await this.sessionModel.create({
      user: userId,
      refreshToken: token,
      userAgent,
      ip,
      expiresAt,
    });

    this.logger.log(`Session created for user ${userId.toString()}`);

    return token;
  }

  /**
   * Validate a session token
   * @param token - The session token to validate
   * @returns The session document if valid, null otherwise
   */
  async validateSession(token: string): Promise<SessionDocument | null> {
    const session = await this.sessionModel
      .findOne({
        refreshToken: token,
        isValid: true,
        expiresAt: { $gt: new Date() },
      })
      .populate('user');

    if (!session) {
      return null;
    }

    // Update last used timestamp
    session.lastUsedAt = new Date();
    await session.save();

    return session;
  }

  /**
   * Invalidate a session (logout)
   * @param token - The session token to invalidate
   * @returns true if session was invalidated, false otherwise
   */
  async invalidateSession(token: string): Promise<boolean> {
    const result = await this.sessionModel.updateOne(
      { refreshToken: token },
      { isValid: false },
    );

    this.logger.log(`Session invalidated: ${result.modifiedCount} document(s)`);

    return result.modifiedCount > 0;
  }

  /**
   * Invalidate all sessions for a user
   * @param userId - The user's ObjectId
   * @returns The number of sessions invalidated
   */
  async invalidateAllSessions(userId: Types.ObjectId): Promise<number> {
    const result = await this.sessionModel.updateMany(
      { user: userId },
      { isValid: false },
    );

    this.logger.log(
      `All sessions invalidated for user ${userId.toString()}: ${result.modifiedCount} document(s)`,
    );

    return result.modifiedCount;
  }
}
