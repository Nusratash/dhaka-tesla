import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from './entities/pool.entity';
import { RideRequest } from './entities/ride-request.entity';
import { StatusHistory } from './entities/status-history.entity';
import { Tesla } from '../teslas/entities/tesla.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { Fare } from '../fares/entities/fare.entity';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { PoolingService } from './pooling.service';
import { FaresModule } from '../fares/fares.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pool, RideRequest, StatusHistory, Tesla, Driver, User, Fare]),
    FaresModule,
    NotificationsModule,
  ],
  providers: [RidesService, PoolingService],
  controllers: [RidesController],
})
export class RidesModule {}
