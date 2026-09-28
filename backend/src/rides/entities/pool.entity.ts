import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { RideStatus } from '../../common/enums/ride-status.enum';
import { Tesla } from '../../teslas/entities/tesla.entity';
import { RideRequest } from './ride-request.entity';
import { StatusHistory } from './status-history.entity';

// A Pool is one physical Tesla trip that can carry 1..N individual
// RideRequests at once (Nusrat + Rafiq sharing Bullet). It owns the shared
// lifecycle state and the seat count that must never exceed the Tesla's
// capacity, even under concurrent claims.
@Entity('pools')
export class Pool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tesla, (tesla) => tesla.pools, { eager: true })
  @JoinColumn()
  tesla: Tesla;

  @Column({ type: 'enum', enum: RideStatus, default: RideStatus.REQUESTED })
  status: RideStatus;

  // Denormalized running total of claimed seats on this pool. Updated only
  // inside a row-locked transaction (see RidesService.claimSeats) so two
  // concurrent claims can never both succeed past capacity.
  @Column({ type: 'int', default: 0 })
  seatsTaken: number;

  // Optimistic-concurrency safety net on top of the pessimistic row lock -
  // belt and suspenders for the capacity race documented in the README.
  @VersionColumn()
  version: number;

  @OneToMany(() => RideRequest, (request) => request.pool)
  requests: RideRequest[];

  @OneToMany(() => StatusHistory, (history) => history.pool)
  statusHistory: StatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
