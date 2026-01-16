import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ required: true })
  permission!: string;

  @Prop({ required: true })
  granted!: boolean;

  @Prop()
  scope?: 'own' | 'all' | 'team';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  grantedBy?: Types.ObjectId;

  @Prop()
  expiresAt?: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Indexes
PermissionSchema.index({ user: 1 });
PermissionSchema.index({ user: 1, permission: 1 }, { unique: true });
PermissionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PermissionDocument = Permission &
  Document & { _id: Types.ObjectId };
