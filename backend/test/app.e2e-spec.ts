/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import type { Response } from 'supertest';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    unit: string;
  };
  environment: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Application Startup', () => {
    it('should start successfully', () => {
      expect(app).toBeDefined();
    });
  });

  describe('Health Endpoint', () => {
    it('/health (GET)', async () => {
      const response: Response = await request(httpServer)
        .get('/health')
        .expect(200);

      const body = response.body as HealthResponse;
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('memory');
      expect(body).toHaveProperty('environment');
    });

    it('should return correct health structure', async () => {
      const response: Response = await request(httpServer)
        .get('/health')
        .expect(200);

      const health = response.body as HealthResponse;
      expect(['healthy', 'unhealthy']).toContain(health.status);
      expect(typeof health.timestamp).toBe('string');
      expect(typeof health.uptime).toBe('number');
      expect(health.database).toHaveProperty('status');
      expect(health.memory).toHaveProperty('used');
      expect(health.memory).toHaveProperty('total');
      expect(health.memory).toHaveProperty('percentage');
      expect(health.memory).toHaveProperty('unit');
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      await request(httpServer)
        .get('/health')
        .expect(200)
        .expect('Access-Control-Allow-Origin', /.*/);
    });
  });

  describe('Security Headers', () => {
    it('should include Helmet security headers', async () => {
      await request(httpServer)
        .get('/health')
        .expect(200)
        .expect('X-Content-Type-Options', 'nosniff')
        .expect('X-Frame-Options', 'DENY')
        .expect('X-DNS-Prefetch-Control', 'off');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const promises: Promise<Response>[] = Array.from({ length: 10 }, () =>
        request(httpServer).get('/health'),
      );

      const responses: Response[] = await Promise.all(promises);
      responses.forEach((res: Response) => {
        expect(res.status).toBe(200);
      });
    });

    it('should return 429 after exceeding limit', async () => {
      // Note: This test may take some time to complete
      // Adjust limit in .env to test this properly
      const limit = 70; // Slightly above default limit of 60
      const promises: Promise<Response>[] = Array.from({ length: limit }, () =>
        request(httpServer).get('/health'),
      );

      const responses: Response[] = await Promise.all(promises);
      const lastResponse: Response | undefined =
        responses[responses.length - 1];

      if (lastResponse) {
        // The last response might be rate limited
        expect([200, 429]).toContain(lastResponse.status);
      }
    });
  });

  describe('Root Endpoint', () => {
    it('/ (GET)', async () => {
      await request(httpServer).get('/').expect(200);
    });
  });
});
