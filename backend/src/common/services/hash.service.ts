import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly rounds: number;

  constructor(private readonly configService: ConfigService) {
    this.rounds = this.configService.get<number>('bcrypt.rounds', 10);
  }

  /**
   * Hash a plain text string using bcrypt
   * @param plainText - The plain text to hash
   * @returns Promise resolving to the hashed string
   */
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.rounds);
  }

  /**
   * Compare a plain text string against a hash
   * @param plainText - The plain text to compare
   * @param hash - The hash to compare against
   * @returns Promise resolving to true if match, false otherwise
   */
  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
