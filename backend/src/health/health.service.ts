import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Health check service
 * Provides comprehensive health status information including database, memory, and uptime
 */
@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Check database health status
   * @returns Database status and response time
   */
  checkDatabaseHealth(): {
    status: 'connected' | 'disconnected' | 'error';
    responseTime?: number;
  } {
    const startTime = Date.now();

    try {
      const readyState = this.connection.readyState;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (readyState === 1) {
        // Connected
        const responseTime = Date.now() - startTime;
        return {
          status: 'connected',
          responseTime,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      } else if (readyState === 2) {
        // Connecting
        return {
          status: 'disconnected',
        };
      } else {
        // Disconnected or error
        return {
          status: 'disconnected',
        };
      }
    } catch {
      return {
        status: 'error',
      };
    }
  }

  /**
   * Get memory usage statistics
   * @returns Memory usage information
   */
  getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
    unit: string;
  } {
    const memoryUsage = process.memoryUsage();
    const used = memoryUsage.heapUsed;
    const total = memoryUsage.heapTotal;
    const percentage = (used / total) * 100;

    return {
      used: Math.round(used / 1024 / 1024),
      total: Math.round(total / 1024 / 1024),
      percentage: Math.round(percentage),
      unit: 'MB',
    };
  }

  /**
   * Get application uptime
   * @returns Uptime in seconds
   */
  getUptime(): number {
    return Math.round(process.uptime());
  }

  /**
   * Get comprehensive health status
   * @returns Complete health information
   */
  getHealth(): {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
      unit: string;
    };
    environment: string;
  } {
    const databaseHealth = this.checkDatabaseHealth();
    const memoryUsage = this.getMemoryUsage();
    const uptime = this.getUptime();

    const isHealthy = databaseHealth.status === 'connected';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime,
      database: databaseHealth,
      memory: memoryUsage,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
