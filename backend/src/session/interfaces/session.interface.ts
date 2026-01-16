import { Types } from 'mongoose';

export interface ISession {
  user: Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
  ip?: string;
  deviceName?: string;
  isValid: boolean;
  lastUsedAt?: Date;
  expiresAt: Date;
}

export type SessionDocument = ISession & Document & { _id: Types.ObjectId };
