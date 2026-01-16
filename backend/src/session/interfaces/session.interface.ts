import { HydratedDocument, Types } from 'mongoose';
import { Session } from '../schemas/session.schema';

export interface ISession {
  user: Types.ObjectId;
  refreshToken: string;
  userAgent: string;
  ip: string;
  deviceName?: string;
  isValid: boolean;
  lastUsedAt?: Date;
  expiresAt: Date;
}

export type SessionDocument = HydratedDocument<Session>;
