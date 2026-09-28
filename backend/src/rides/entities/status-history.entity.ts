import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RideStatus } from '../../common/enums/ride-status.enum';
import { Pool } from './pool.entity';

// Append-only audit trail: "hold onto enough history to explain exactly
// what happened, in case anyone asks later" (brief, section 2).
@Entity('status_history')
export class StatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pool, (pool) => pool.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn()
  pool: Pool;

  @Column({ type: 'enum', enum: RideStatus })
  fromStatus: RideStatus | null;

  @Column({ type: 'enum', enum: RideStatus })
  toStatus: RideStatus;

  @Column({ nullable: true })
  changedByUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
