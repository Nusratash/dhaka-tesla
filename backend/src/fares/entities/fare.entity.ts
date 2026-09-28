import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RideRequest } from '../../rides/entities/ride-request.entity';

// All monetary columns are integer poysha (1 BDT = 100 poysha) - see
// README "Money representation" - so fare math is exact, never float.
@Entity('fares')
export class Fare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => RideRequest, (request) => request.fare, { onDelete: 'CASCADE' })
  @JoinColumn()
  rideRequest: RideRequest;

  @Column({ type: 'bigint' })
  baseFarePoysha: number;

  @Column({ type: 'bigint' })
  distanceChargePoysha: number;

  @Column({ type: 'bigint', default: 0 })
  poolDiscountPoysha: number;

  @Column({ type: 'bigint' })
  totalFarePoysha: number;
}
