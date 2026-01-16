import { Injectable } from '@nestjs/common';

/**
 * Root application service
 * Provides basic application information
 */
@Injectable()
export class AppService {
  /**
   * Get welcome message
   * Returns a simple status message for the root endpoint
   * @returns Welcome message
   */
  getHello(): string {
    return 'Hello World!';
  }
}
