import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../users/entities/wallet.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Tesla } from '../teslas/entities/tesla.entity';
import { Pool } from '../rides/entities/pool.entity';
import { RideRequest } from '../rides/entities/ride-request.entity';
import { StatusHistory } from '../rides/entities/status-history.entity';
import { Fare } from '../fares/entities/fare.entity';

// Single source of truth for entities + connection options, shared by
// NestJS (via forRoot) and the TypeORM CLI (via `npm run typeorm`).
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'tesla_pool',
  password: process.env.DB_PASSWORD ?? 'tesla_pool_pw',
  database: process.env.DB_NAME ?? 'dhaka_tesla_pool',
  entities: [User, Wallet, Driver, Tesla, Pool, RideRequest, StatusHistory, Fare],
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
};

export default new DataSource(typeOrmConfig);
