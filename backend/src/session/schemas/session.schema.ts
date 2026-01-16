import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  refreshToken!: string;

  @Prop({ required: true })
  userAgent!: string;

  @Prop({ required: true })
  ip!: string;

  @Prop()
  deviceName?: string;

  @Prop({ default: true })
  isValid!: boolean;

  @Prop()
  lastUsedAt?: Date;

  @Prop({ required: true })
  expiresAt!: Date;
}

export type SessionDocument = HydratedDocument<Session>;

export const SessionSchema: MongooseSchema<Session> =
  SchemaFactory.createForClass(Session);

// Indexes
SessionSchema.index({ user: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ user: 1, userAgent: 1 });
