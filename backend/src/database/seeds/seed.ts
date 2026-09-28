import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/typeorm.config';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../users/entities/wallet.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Tesla } from '../../teslas/entities/tesla.entity';
import { UserRole } from '../../common/enums/ride-status.enum';

// Seeds exactly the story cast the brief requires (section 18): Jashim +
// Bullet as the driver/Tesla, Nusrat/Rafiq/Shirin as passengers - never
// generic user1/driver1 placeholders. Idempotent: safe to re-run.
async function seed() {
  await dataSource.initialize();

  const usersRepo = dataSource.getRepository(User);
  const driversRepo = dataSource.getRepository(Driver);
  const teslasRepo = dataSource.getRepository(Tesla);

  const passwordHash = await bcrypt.hash('Passw0rd!', 10);

  async function upsertUser(email: string, fullName: string, phone: string, role: UserRole) {
    let user = await usersRepo.findOne({ where: { email } });
    if (user) return user;
    const wallet = new Wallet();
    wallet.balancePoysha = 100000; // 1000.00 BDT starting TeslaPay balance
    user = usersRepo.create({ email, passwordHash, fullName, phone, role, wallet });
    return usersRepo.save(user);
  }

  const jashim = await upsertUser('jashim@teslapool.example', 'Jashim Uddin', '+8801710000001', UserRole.DRIVER);
  const nusrat = await upsertUser('nusrat@teslapool.example', 'Nusrat Jahan', '+8801710000002', UserRole.PASSENGER);
  const rafiq = await upsertUser('rafiq@teslapool.example', 'Rafiq Islam', '+8801710000003', UserRole.PASSENGER);
  const shirin = await upsertUser('shirin@teslapool.example', 'Shirin Akter', '+8801710000004', UserRole.PASSENGER);

  let bullet = await teslasRepo.findOne({ where: { plateNumber: 'DHK-TESLA-01' } });
  if (!bullet) {
    bullet = await teslasRepo.save(
      teslasRepo.create({ nickname: 'Bullet', vehicleType: 'three-wheeler', plateNumber: 'DHK-TESLA-01', seatCapacity: 3 }),
    );
  }

  let jashimDriver = await driversRepo.findOne({ where: { user: { id: jashim.id } }, relations: ['user', 'tesla'] });
  if (!jashimDriver) {
    jashimDriver = await driversRepo.save(driversRepo.create({ user: jashim, tesla: bullet, isOnline: true }));
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete:');
  console.log(`  Driver:  ${jashim.email} / Passw0rd!  (owns Tesla "Bullet", plate ${bullet.plateNumber}, 3 seats)`);
  console.log(`  Passenger: ${nusrat.email} / Passw0rd!  (Banani -> Mohakhali)`);
  console.log(`  Passenger: ${rafiq.email} / Passw0rd!  (Banani -> Gulshan 1)`);
  console.log(`  Passenger: ${shirin.email} / Passw0rd!  (tries to claim the last seat)`);

  await dataSource.destroy();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
