/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    getHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return healthy status when database is connected', () => {
      const healthData = {
        status: 'healthy' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 100,
        database: {
          status: 'connected' as const,
          responseTime: 5,
        },
        memory: {
          used: 100,
          total: 500,
          percentage: 20,
          unit: 'MB',
        },
        environment: 'development',
      };

      mockHealthService.getHealth.mockReturnValue(healthData);

      const result = controller.getHealth();

      expect(service.getHealth).toHaveBeenCalled();
      expect(result).toEqual({
        httpStatus: 200,
        ...healthData,
      });
    });

    it('should return unhealthy status when database is disconnected', () => {
      const healthData = {
        status: 'unhealthy' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 100,
        database: {
          status: 'disconnected' as const,
        },
        memory: {
          used: 100,
          total: 500,
          percentage: 20,
          unit: 'MB',
        },
        environment: 'development',
      };

      mockHealthService.getHealth.mockReturnValue(healthData);

      const result = controller.getHealth();

      expect(service.getHealth).toHaveBeenCalled();
      expect(result).toEqual({
        httpStatus: 503,
        ...healthData,
      });
    });

    it('should return unhealthy status when database has error', () => {
      const healthData = {
        status: 'unhealthy' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 100,
        database: {
          status: 'error' as const,
        },
        memory: {
          used: 100,
          total: 500,
          percentage: 20,
          unit: 'MB',
        },
        environment: 'development',
      };

      mockHealthService.getHealth.mockReturnValue(healthData);

      const result = controller.getHealth();

      expect(service.getHealth).toHaveBeenCalled();
      expect(result).toEqual({
        httpStatus: 503,
        ...healthData,
      });
    });
  });
});
