/**
 * Integration test for the exact concurrency scenario in the brief
 * (section 12/14): Bullet has 1 seat left; Nusrat and Shirin both try to
 * claim it at nearly the same instant.
 *
 * Requires a real Postgres connection (the docker-compose "postgres"
 * service) because the guarantee under test is a DB-level row lock, which
 * cannot be faithfully exercised against a mock repository.
 *
 * Run with the stack's DB up:
 *   docker compose up -d postgres
 *   DB_HOST=localhost npm run test -- concurrency
 */
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../src/config/typeorm.config';
import { RidesModule } from '../src/rides/rides.module';
import { RidesService } from '../src/rides/rides.service';
import { DataSource } from 'typeorm';
import { Tesla } from '../src/teslas/entities/tesla.entity';
import { Driver } from '../src/drivers/entities/driver.entity';
import { User } from '../src/users/entities/user.entity';
import { Wallet } from '../src/users/entities/wallet.entity';
import { UserRole } from '../src/common/enums/ride-status.enum';

describe('Seat capacity concurrency (last-seat race)', () => {
  let dataSource: DataSource;
  let ridesService: RidesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeOrmConfig), RidesModule],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    ridesService = moduleRef.get(RidesService);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('lets exactly one of two simultaneous last-seat claims through Bullet capacity 3', async () => {
    const driverUser = await dataSource.getRepository(User).save({
      email: `jashim.${Date.now()}@test.local`,
      passwordHash: 'x',
      fullName: 'Jashim Uddin',
      phone: '+8801710000099',
      role: UserRole.DRIVER,
      wallet: dataSource.getRepository(Wallet).create({ balancePoysha: 0 }),
    });
    const tesla = await dataSource.getRepository(Tesla).save({
      nickname: 'Bullet', vehicleType: 'three-wheeler', plateNumber: `TEST-${Date.now()}`, seatCapacity: 3,
    });
    await dataSource.getRepository(Driver).save({ user: driverUser, tesla, isOnline: true });

    // Pre-fill 2 of 3 seats with an initial request (simulates Nusrat + Rafiq already aboard).
    const nusrat = await dataSource.getRepository(User).save({
      email: `nusrat.${Date.now()}@test.local`, passwordHash: 'x', fullName: 'Nusrat Jahan',
      phone: '+8801710000098', role: UserRole.PASSENGER,
      wallet: dataSource.getRepository(Wallet).create({ balancePoysha: 0 }),
    });
    const shirin = await dataSource.getRepository(User).save({
      email: `shirin.${Date.now()}@test.local`, passwordHash: 'x', fullName: 'Shirin Akter',
      phone: '+8801710000097', role: UserRole.PASSENGER,
      wallet: dataSource.getRepository(Wallet).create({ balancePoysha: 0 }),
    });
    const rafiqAsLastSeatContender = await dataSource.getRepository(User).save({
      email: `rafiq.${Date.now()}@test.local`, passwordHash: 'x', fullName: 'Rafiq Islam',
      phone: '+8801710000096', role: UserRole.PASSENGER,
      wallet: dataSource.getRepository(Wallet).create({ balancePoysha: 0 }),
    });

    await ridesService.createRequest(nusrat.id, {
      pickupZone: 'Banani', destinationZone: 'Mohakhali', seatsRequested: 2,
    });

    // Now exactly 1 seat is left on Bullet. Fire two claims for it at once.
    const results = await Promise.allSettled([
      ridesService.createRequest(shirin.id, { pickupZone: 'Banani', destinationZone: 'Mohakhali', seatsRequested: 1 }),
      ridesService.createRequest(rafiqAsLastSeatContender.id, { pickupZone: 'Banani', destinationZone: 'Mohakhali', seatsRequested: 1 }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });
});
