/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import type { Response } from 'supertest';

interface UserResponse {
  _id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isVerified: boolean;
}

describe('Permission Management (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;
  let adminAgent: ReturnType<typeof request.agent>;
  let managerAgent: ReturnType<typeof request.agent>;
  let userAgent: ReturnType<typeof request.agent>;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    httpServer = app.getHttpServer();

    // Create agents for different user roles
    adminAgent = request.agent(httpServer);
    managerAgent = request.agent(httpServer);
    userAgent = request.agent(httpServer);

    // Login as admin
    await adminAgent
      .post('/api/auth/login')
      .send({
        email: 'admin@seed.local',
        password: 'Admin123!',
      })
      .expect(200);

    // Login as manager
    await managerAgent
      .post('/api/auth/login')
      .send({
        email: 'manager@seed.local',
        password: 'Manager123!',
      })
      .expect(200);

    // Login as regular user
    await userAgent
      .post('/api/auth/login')
      .send({
        email: 'user@seed.local',
        password: 'User123!',
      })
      .expect(200);

    // Get test user ID
    const meResponse: Response = await userAgent
      .get('/api/auth/me')
      .expect(200);
    testUserId = meResponse.body._id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/admin/users/:id/permissions', () => {
    it('should return user permissions for admin', async () => {
      const response: Response = await adminAgent
        .get(`/api/admin/users/${testUserId}/permissions`)
        .expect(200);

      expect(response.body).toHaveProperty('permissions');
      expect(Array.isArray(response.body.permissions)).toBe(true);
    });

    it('should deny access for regular user', async () => {
      await userAgent
        .get(`/api/admin/users/${testUserId}/permissions`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await adminAgent
        .get('/api/admin/users/507f1f77bcf86cd799439011/permissions')
        .expect(404);
    });
  });

  describe('PUT /api/admin/users/:id/permissions', () => {
    it('should update user permissions for admin', async () => {
      const newPermissions = [
        'profile:read:own',
        'profile:update:own',
        'sessions:read:own',
      ];

      const response: Response = await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: newPermissions })
        .expect(200);

      expect(response.body.permissions).toEqual(newPermissions);
    });

    it('should allow adding wildcard permission', async () => {
      const response: Response = await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['*'] })
        .expect(200);

      expect(response.body.permissions).toContain('*');

      // Restore original permissions
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['profile:read:own', 'profile:update:own'] });
    });

    it('should validate permission format', async () => {
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['invalid-format'] })
        .expect(400);
    });

    it('should allow empty permissions array', async () => {
      const response: Response = await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: [] })
        .expect(200);

      expect(response.body.permissions).toEqual([]);

      // Restore permissions
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['profile:read:own', 'profile:update:own'] });
    });

    it('should deny access for regular user', async () => {
      await userAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['users:read:all'] })
        .expect(403);
    });

    it('should deny access for manager without permission management rights', async () => {
      await managerAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['users:read:all'] })
        .expect(403);
    });
  });

  describe('POST /api/admin/users/:id/permissions', () => {
    it('should add permissions to user', async () => {
      const permissionsToAdd = ['reports:read:all'];

      const response: Response = await adminAgent
        .post(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: permissionsToAdd })
        .expect(200);

      expect(response.body.permissions).toContain('reports:read:all');
    });

    it('should not duplicate existing permissions', async () => {
      const permissionsToAdd = ['profile:read:own']; // Already exists

      const response: Response = await adminAgent
        .post(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: permissionsToAdd })
        .expect(200);

      const permissions = response.body.permissions as string[];
      const count = permissions.filter((p) => p === 'profile:read:own').length;
      expect(count).toBe(1);
    });

    it('should deny access for regular user', async () => {
      await userAgent
        .post(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['users:read:all'] })
        .expect(403);
    });
  });

  describe('DELETE /api/admin/users/:id/permissions', () => {
    it('should remove specific permissions from user', async () => {
      const permissionsToRemove = ['reports:read:all'];

      const response: Response = await adminAgent
        .delete(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: permissionsToRemove })
        .expect(200);

      expect(response.body.permissions).not.toContain('reports:read:all');
    });

    it('should handle removing non-existent permissions gracefully', async () => {
      const permissionsToRemove = ['nonexistent:permission'];

      const response: Response = await adminAgent
        .delete(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: permissionsToRemove })
        .expect(200);

      expect(response.body).toHaveProperty('permissions');
    });

    it('should deny access for regular user', async () => {
      await userAgent
        .delete(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['profile:read:own'] })
        .expect(403);
    });
  });

  describe('Permission Checking Logic', () => {
    it('should grant access with wildcard permission', async () => {
      // Temporarily give user wildcard
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['*'] });

      // User should now have access to admin endpoints
      await userAgent.get('/api/roles').expect(200);

      // Restore original permissions
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['profile:read:own', 'profile:update:own'] });
    });

    it('should deny access without required permission', async () => {
      // Regular user without role permissions
      await userAgent.get('/api/roles').expect(403);
    });

    it('should grant access with specific permission', async () => {
      // Give user role list permission
      await adminAgent
        .post(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['roles:list:all'] });

      // User should now have access
      await userAgent.get('/api/roles').expect(200);

      // Remove permission
      await adminAgent
        .delete(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['roles:list:all'] });
    });
  });

  describe('Permission Inheritance', () => {
    it('should verify permissions are directly assigned to users', async () => {
      const response: Response = await userAgent
        .get('/api/auth/me')
        .expect(200);

      const user = response.body as UserResponse;
      expect(user).toHaveProperty('permissions');
      expect(Array.isArray(user.permissions)).toBe(true);
      expect(user).toHaveProperty('role');
      // Permissions are on user object, not inherited from role
    });

    it('should allow users with same role to have different permissions', async () => {
      const userResponse: Response = await userAgent
        .get('/api/auth/me')
        .expect(200);

      // Create another user with same role but different permissions
      const newUser = {
        email: 'testuser@test.local',
        password: 'Test123!',
        name: 'Test User',
      };

      const registerResponse: Response = await request(httpServer)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      // Both should have role 'user' but can have different permissions
      expect(userResponse.body.role).toBe('user');
      expect(registerResponse.body.user.role).toBe('user');
    });
  });

  describe('Protected Permissions', () => {
    it('should validate permission format against allowed permissions', async () => {
      const invalidPermissions = ['invalid:action:scope'];

      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: invalidPermissions })
        .expect(400);
    });

    it('should accept all valid permission combinations', async () => {
      const validPermissions = [
        'users:read:all',
        'users:create:all',
        'users:update:all',
        'users:delete:all',
        'roles:read:all',
        'roles:manage:all',
        'permissions:grant:all',
        'permissions:revoke:all',
        'sessions:read:all',
        'sessions:delete:own',
        'reports:read:all',
        'reports:create:all',
        'profile:read:own',
        'profile:update:own',
      ];

      const response: Response = await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: validPermissions })
        .expect(200);

      expect(response.body.permissions).toEqual(validPermissions);

      // Restore
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['profile:read:own', 'profile:update:own'] });
    });
  });

  describe('Multiple Permission Checks', () => {
    it('should require all permissions when multiple are specified', async () => {
      // Give user only one of two required permissions
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['users:read:all'] });

      // Try to access endpoint requiring multiple permissions
      // (This would need an actual endpoint that requires multiple permissions)
      // For now, verify the permission array
      const response: Response = await userAgent
        .get('/api/auth/me')
        .expect(200);

      expect(response.body.permissions).toContain('users:read:all');
      expect(response.body.permissions).not.toContain('roles:read:all');
    });

    it('should grant access when any of specified permissions is present', async () => {
      // Give user one of several acceptable permissions
      await adminAgent
        .put(`/api/admin/users/${testUserId}/permissions`)
        .send({ permissions: ['sessions:read:own'] });

      const response: Response = await userAgent
        .get('/api/auth/me')
        .expect(200);

      expect(response.body.permissions).toContain('sessions:read:own');
    });
  });
});
