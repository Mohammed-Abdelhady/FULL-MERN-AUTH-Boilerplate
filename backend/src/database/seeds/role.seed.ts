import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../role/schemas/role.schema';

/**
 * Seed service for default system roles.
 * Creates USER, SUPPORT, MANAGER, and ADMIN roles with appropriate permissions.
 */
@Injectable()
export class RoleSeedService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  /**
   * Seed default roles if they don't exist
   */
  async seed(): Promise<void> {
    const defaultRoles = [
      {
        name: 'User',
        slug: 'user',
        description: 'Default role for all customers',
        isSystemRole: true,
        isProtected: true, // USER role is protected from deletion/modification
        permissions: ['profile:read:own', 'profile:update:own'],
      },
      {
        name: 'Support',
        slug: 'support',
        description: 'Customer support staff',
        isSystemRole: true,
        isProtected: false,
        permissions: [
          'profile:read:own',
          'profile:update:own',
          'users:read:all',
          'sessions:read:all',
        ],
      },
      {
        name: 'Manager',
        slug: 'manager',
        description: 'Management staff',
        isSystemRole: true,
        isProtected: false,
        permissions: [
          'profile:read:own',
          'profile:update:own',
          'users:read:all',
          'users:update:all',
          'sessions:read:all',
          'roles:read:all',
        ],
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'System administrator with full access',
        isSystemRole: true,
        isProtected: false,
        permissions: ['*'], // Wildcard grants all permissions
      },
    ];

    for (const roleData of defaultRoles) {
      // Check if role already exists
      const exists = await this.roleModel.findOne({ slug: roleData.slug });

      if (!exists) {
        await this.roleModel.create(roleData);
        console.log(`✅ Created default role: ${roleData.name}`);
      } else {
        console.log(`ℹ️  Role "${roleData.name}" already exists, skipping...`);
      }
    }

    console.log('✅ Role seeding completed');
  }

  /**
   * Update existing roles' permissions (for migrations)
   */
  async updateRolePermissions(): Promise<void> {
    const updates = [
      {
        slug: 'user',
        permissions: ['profile:read:own', 'profile:update:own'],
      },
      {
        slug: 'support',
        permissions: [
          'profile:read:own',
          'profile:update:own',
          'users:read:all',
          'sessions:read:all',
        ],
      },
      {
        slug: 'manager',
        permissions: [
          'profile:read:own',
          'profile:update:own',
          'users:read:all',
          'users:update:all',
          'sessions:read:all',
          'roles:read:all',
        ],
      },
      {
        slug: 'admin',
        permissions: ['*'],
      },
    ];

    for (const update of updates) {
      await this.roleModel.updateOne(
        { slug: update.slug },
        { $set: { permissions: update.permissions } },
      );
      console.log(`✅ Updated permissions for role: ${update.slug}`);
    }

    console.log('✅ Role permission updates completed');
  }
}
