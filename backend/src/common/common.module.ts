import { Module } from '@nestjs/common';
import { HashService } from './services/hash.service';

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class CommonModule {}
