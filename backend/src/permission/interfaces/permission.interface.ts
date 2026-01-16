import { Types } from 'mongoose';

export interface IPermission {
  user: Types.ObjectId;
  permission: string;
  granted: boolean;
  scope?: 'own' | 'all' | 'team';
  grantedBy?: Types.ObjectId;
  expiresAt?: Date;
}

export type PermissionDocument = IPermission &
  Document & { _id: Types.ObjectId };
