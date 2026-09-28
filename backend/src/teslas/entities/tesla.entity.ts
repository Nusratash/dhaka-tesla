import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';
import { Pool } from '../../rides/entities/pool.entity';

@Entity('teslas')
export class Tesla {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "Bullet"
  @Column()
  nickname: string;

  @Column({ default: 'three-wheeler' })
  vehicleType: string;

  @Column()
  plateNumber: string;

  @Column({ type: 'int' })
  seatCapacity: number;

  @OneToOne(() => Driver, (driver) => driver.tesla)
  driver: Driver;

  @OneToMany(() => Pool, (pool) => pool.tesla)
  pools: Pool[];
}
