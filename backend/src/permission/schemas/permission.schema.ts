import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

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

  // Timestamp fields (automatically managed by Mongoose with timestamps: true)
  createdAt!: Date;
  updatedAt!: Date;
}

export type PermissionDocument = HydratedDocument<Permission>;

export const PermissionSchema: MongooseSchema<Permission> =
  SchemaFactory.createForClass(Permission);

// Indexes
PermissionSchema.index({ user: 1 });
PermissionSchema.index({ user: 1, permission: 1 }, { unique: true });
PermissionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
