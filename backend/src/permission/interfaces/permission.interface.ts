import { HydratedDocument, Types } from 'mongoose';
import { Permission } from '../schemas/permission.schema';

export interface IPermission {
  user: Types.ObjectId;
  permission: string;
  granted: boolean;
  scope?: 'own' | 'all' | 'team';
  grantedBy?: Types.ObjectId;
  expiresAt?: Date;
}

export type PermissionDocument = HydratedDocument<Permission>;
