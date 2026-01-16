import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ sparse: true, unique: true })
  googleId?: string;

  @Prop({ sparse: true, unique: true })
  facebookId?: string;

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
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ facebookId: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isDeleted: 1 });

export type UserDocument = User & Document & { _id: Types.ObjectId };
