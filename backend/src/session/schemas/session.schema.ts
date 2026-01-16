import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  refreshToken!: string;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;

  @Prop()
  deviceName?: string;

  @Prop({ default: true })
  isValid!: boolean;

  @Prop()
  lastUsedAt?: Date;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Indexes
SessionSchema.index({ user: 1 });
SessionSchema.index({ refreshToken: 1 }, { unique: true });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ user: 1, userAgent: 1 });

export type SessionDocument = Session & Document & { _id: Types.ObjectId };
