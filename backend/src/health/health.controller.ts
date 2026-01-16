import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

/**
 * Health check controller
 * Provides endpoint for monitoring application health status
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Get comprehensive health status
   * @returns Health status information
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns health status of application, including database connectivity and uptime.',
  })
  getHealth() {
    const health = this.healthService.getHealth();

    // Return 503 if unhealthy
    if (health.status === 'unhealthy') {
      return {
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
        ...health,
      };
    }

    return {
      httpStatus: HttpStatus.OK,
      ...health,
    };
  }
}
