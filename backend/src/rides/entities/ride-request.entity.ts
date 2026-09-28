import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RideStatus } from '../../common/enums/ride-status.enum';
import { User } from '../../users/entities/user.entity';
import { Pool } from './pool.entity';
import { Fare } from '../../fares/entities/fare.entity';

// One passenger's individual request. Several requests can point at the
// same Pool once matched; each still carries its own status/fare so a
// passenger only ever sees their own data.
@Entity('ride_requests')
export class RideRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  passenger: User;

  @Column()
  pickupZone: string;

  @Column()
  destinationZone: string;

  @Column({ type: 'int', default: 1 })
  seatsRequested: number;

  @Column({ type: 'enum', enum: RideStatus, default: RideStatus.REQUESTED })
  status: RideStatus;

  // Nullable until a pool match is found.
  @ManyToOne(() => Pool, (pool) => pool.requests, { nullable: true, eager: true })
  @JoinColumn()
  pool: Pool | null;

  @OneToOne(() => Fare, (fare) => fare.rideRequest, { cascade: true, nullable: true, eager: true })
  fare: Fare | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
