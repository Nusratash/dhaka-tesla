import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tesla } from './entities/tesla.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { TeslasService } from './teslas.service';
import { TeslasController } from './teslas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tesla, Driver])],
  providers: [TeslasService],
  controllers: [TeslasController],
  exports: [TeslasService],
})
export class TeslasModule {}
