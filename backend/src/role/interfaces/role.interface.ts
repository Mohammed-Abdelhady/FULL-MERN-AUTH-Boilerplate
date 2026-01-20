export interface IRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystemRole: boolean;
  isProtected: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleListResponse {
  roles: IRole[];
  total: number;
  page: number;
  pages: number;
}
