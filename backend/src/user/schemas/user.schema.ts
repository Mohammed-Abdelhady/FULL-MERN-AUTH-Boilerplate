import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';
import { AuthProvider } from '../enums/auth-provider.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ enum: AuthProvider, default: AuthProvider.EMAIL })
  authProvider!: AuthProvider;

  @Prop({ sparse: true, unique: true })
  googleId?: string;

  @Prop({ sparse: true, unique: true })
  facebookId?: string;

  @Prop({ sparse: true, unique: true })
  githubId?: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  verificationExpires?: Date;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: [String], default: [] })
  linkedProviders!: string[];

  @Prop({ enum: AuthProvider, nullable: true })
  primaryProvider?: AuthProvider;

  @Prop()
  profileSyncedAt?: Date;

  @Prop()
  lastSyncedProvider?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema: MongooseSchema<User> =
  SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ linkedProviders: 1 });
