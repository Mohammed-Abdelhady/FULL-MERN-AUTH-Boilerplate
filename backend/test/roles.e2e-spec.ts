/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import type { Response } from 'supertest';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
}

interface RoleResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
  isProtected: boolean;
  createdAt: string;
  updatedAt: string;
}

describe('Role Management (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;
  let adminAgent: ReturnType<typeof request.agent>;
  let userAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    httpServer = app.getHttpServer();

    // Create agents to maintain session cookies
    adminAgent = request.agent(httpServer);
    userAgent = request.agent(httpServer);

    // Login as admin
    await adminAgent
      .post('/api/auth/login')
      .send({
        email: 'admin@seed.local',
        password: 'Admin123!',
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/roles', () => {
    it('should return all roles for admin with wildcard permission', async () => {
      const response: Response = await adminAgent.get('/api/roles').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const role = response.body[0] as RoleResponse;
      expect(role).toHaveProperty('_id');
      expect(role).toHaveProperty('name');
      expect(role).toHaveProperty('slug');
      expect(role).toHaveProperty('permissions');
      expect(role).toHaveProperty('isSystemRole');
      expect(role).toHaveProperty('isProtected');
    });

    it('should deny access for regular user without permission', async () => {
      await userAgent.get('/api/roles').expect(403);
    });

    it('should deny access for unauthenticated users', async () => {
      await request(httpServer).get('/api/roles').expect(401);
    });
  });

  describe('GET /api/roles/:slug', () => {
    it('should return a specific role by slug', async () => {
      const response: Response = await adminAgent
        .get('/api/roles/admin')
        .expect(200);

      const role = response.body as RoleResponse;
      expect(role.slug).toBe('admin');
      expect(role.name).toBe('Admin');
      expect(Array.isArray(role.permissions)).toBe(true);
    });

    it('should return 404 for non-existent role', async () => {
      await adminAgent.get('/api/roles/nonexistent-role').expect(404);
    });

    it('should deny access for regular user', async () => {
      await userAgent.get('/api/roles/admin').expect(403);
    });
  });

  describe('POST /api/roles', () => {
    it('should create a new role with valid data', async () => {
      const newRole = {
        name: 'Test Role',
        description: 'Role created during E2E testing',
        permissions: ['users:read:all', 'sessions:read:own'],
      };

      const response: Response = await adminAgent
        .post('/api/roles')
        .send(newRole)
        .expect(201);

      const role = response.body as RoleResponse;
      expect(role.name).toBe(newRole.name);
      expect(role.slug).toBe('test-role');
      expect(role.description).toBe(newRole.description);
      expect(role.permissions).toEqual(newRole.permissions);
      expect(role.isSystemRole).toBe(false);
      expect(role.isProtected).toBe(false);
    });

    it('should reject duplicate role names', async () => {
      const duplicateRole = {
        name: 'Test Role', // Already created in previous test
        permissions: ['users:read:all'],
      };

      await adminAgent.post('/api/roles').send(duplicateRole).expect(409);
    });

    it('should validate required fields', async () => {
      await adminAgent
        .post('/api/roles')
        .send({ description: 'Missing name' })
        .expect(400);
    });

    it('should validate permission format', async () => {
      const invalidRole = {
        name: 'Invalid Permission Role',
        permissions: ['invalid-permission-format'],
      };

      await adminAgent.post('/api/roles').send(invalidRole).expect(400);
    });

    it('should deny access for regular user', async () => {
      await userAgent
        .post('/api/roles')
        .send({ name: 'User Role', permissions: [] })
        .expect(403);
    });
  });

  describe('PATCH /api/roles/:slug', () => {
    it('should update a non-protected role', async () => {
      const updates = {
        description: 'Updated description',
        permissions: ['users:read:all', 'roles:read:all'],
      };

      const response: Response = await adminAgent
        .patch('/api/roles/test-role')
        .send(updates)
        .expect(200);

      const role = response.body as RoleResponse;
      expect(role.description).toBe(updates.description);
      expect(role.permissions).toEqual(updates.permissions);
    });

    it('should allow updating description of protected role', async () => {
      const updates = {
        description: 'Updated user role description',
      };

      const response: Response = await adminAgent
        .patch('/api/roles/user')
        .send(updates)
        .expect(200);

      expect(response.body.description).toBe(updates.description);
    });

    it('should prevent renaming protected roles', async () => {
      await adminAgent
        .patch('/api/roles/user')
        .send({ name: 'Renamed User' })
        .expect(400);
    });

    it('should return 404 for non-existent role', async () => {
      await adminAgent
        .patch('/api/roles/nonexistent')
        .send({ description: 'Test' })
        .expect(404);
    });

    it('should deny access for regular user', async () => {
      await userAgent
        .patch('/api/roles/test-role')
        .send({ description: 'Unauthorized update' })
        .expect(403);
    });
  });

  describe('DELETE /api/roles/:slug', () => {
    it('should prevent deletion of protected roles', async () => {
      await adminAgent.delete('/api/roles/user').expect(400);
    });

    it('should delete non-protected custom roles', async () => {
      await adminAgent.delete('/api/roles/test-role').expect(200);

      // Verify role is deleted
      await adminAgent.get('/api/roles/test-role').expect(404);
    });

    it('should return 404 for non-existent role', async () => {
      await adminAgent.delete('/api/roles/nonexistent').expect(404);
    });

    it('should deny access for regular user', async () => {
      await userAgent.delete('/api/roles/test-role').expect(403);
    });
  });

  describe('Permission Validation', () => {
    it('should accept valid permission formats', async () => {
      const validPermissions = [
        'users:read:all',
        'users:read:own',
        'roles:manage:all',
        'sessions:delete:own',
        'reports:create:all',
      ];

      const role = {
        name: 'Valid Permissions Role',
        permissions: validPermissions,
      };

      const response: Response = await adminAgent
        .post('/api/roles')
        .send(role)
        .expect(201);

      expect(response.body.permissions).toEqual(validPermissions);

      // Cleanup
      await adminAgent.delete(`/api/roles/${response.body.slug}`);
    });

    it('should accept wildcard permission', async () => {
      const role = {
        name: 'Wildcard Role',
        permissions: ['*'],
      };

      const response: Response = await adminAgent
        .post('/api/roles')
        .send(role)
        .expect(201);

      expect(response.body.permissions).toContain('*');

      // Cleanup
      await adminAgent.delete(`/api/roles/${response.body.slug}`);
    });
  });

  describe('Role Hierarchy and System Roles', () => {
    it('should mark seeded roles as system roles', async () => {
      const response: Response = await adminAgent.get('/api/roles').expect(200);

      const systemRoles = response.body.filter(
        (role: RoleResponse) => role.isSystemRole,
      );

      expect(systemRoles.length).toBeGreaterThan(0);
      expect(systemRoles.some((r: RoleResponse) => r.slug === 'admin')).toBe(
        true,
      );
      expect(systemRoles.some((r: RoleResponse) => r.slug === 'user')).toBe(
        true,
      );
    });

    it('should mark USER role as protected', async () => {
      const response: Response = await adminAgent
        .get('/api/roles/user')
        .expect(200);

      const role = response.body as RoleResponse;
      expect(role.isProtected).toBe(true);
    });
  });

  describe('Session-based Authentication', () => {
    it('should maintain session across multiple requests', async () => {
      // First request
      await adminAgent.get('/api/roles').expect(200);

      // Second request - session should still be valid
      await adminAgent.get('/api/roles').expect(200);
    });

    it('should reject requests after logout', async () => {
      const tempAgent = request.agent(httpServer);

      // Login
      await tempAgent
        .post('/api/auth/login')
        .send({
          email: 'support@seed.local',
          password: 'Support123!',
        })
        .expect(200);

      // Should have access
      await tempAgent.get('/api/roles').expect(403); // Support user doesn't have role permissions, but authenticated

      // Logout
      await tempAgent.post('/api/auth/logout').expect(200);

      // Should be unauthorized after logout
      await tempAgent.get('/api/roles').expect(401);
    });
  });

  describe('Admin User Permissions', () => {
    it('should verify admin has wildcard permission', async () => {
      const response: Response = await adminAgent
        .get('/api/auth/me')
        .expect(200);

      const user = response.body as LoginResponse['user'];
      expect(user.permissions).toContain('*');
    });
  });

  describe('Regular User Permissions', () => {
    it('should verify regular user has limited permissions', async () => {
      const response: Response = await userAgent
        .get('/api/auth/me')
        .expect(200);

      const user = response.body as LoginResponse['user'];
      expect(user.permissions).not.toContain('*');
      expect(user.permissions).not.toContain('users:read:all');
    });
  });
});
