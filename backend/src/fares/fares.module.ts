import { Module } from '@nestjs/common';
import { FaresService } from './fares.service';

@Module({
  providers: [FaresService],
  exports: [FaresService],
})
export class FaresModule {}
