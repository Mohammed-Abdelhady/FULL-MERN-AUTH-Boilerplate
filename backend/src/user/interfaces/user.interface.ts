import { Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  googleId?: string;
  facebookId?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export type UserDocument = IUser & Document & { _id: Types.ObjectId };
