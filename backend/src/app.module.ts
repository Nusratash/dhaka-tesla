import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { TeslasModule } from './teslas/teslas.module';
import { RidesModule } from './rides/rides.module';
import { FaresModule } from './fares/fares.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ZonesModule } from './zones/zones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    DriversModule,
    TeslasModule,
    ZonesModule,
    RidesModule,
    FaresModule,
    NotificationsModule,
  ],
})
export class AppModule {}
